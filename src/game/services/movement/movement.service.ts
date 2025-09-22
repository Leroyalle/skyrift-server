import { Injectable } from '@nestjs/common';
import { PlayerStateService } from 'src/game/services/player-state/player-state.service';
import { LocationService } from 'src/location/location.service';
import { SocketService } from '../socket/socket.service';
import { RequestMoveToDto } from 'src/game/dto/request-move-to.dto';
import { Socket } from 'socket.io';
import { BatchUpdateMovement } from 'src/game/types/batch-update/batch-update-movement.type';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { getDirection } from 'src/game/lib/get-direction.lib';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import {
  CharacterMovementQueue,
  MobMovementQueue,
} from './types/movement-queue.type';
import { PathFindingService } from '../path-finding/path-finding.service';
import { InteractionService } from '../interaction/interaction.service';
import { RuntimeMobService } from '../runtime-mob/runtime-mob.service';
import { RuntimeMob } from '../runtime-mob/types/runtime-mob.type';

@Injectable()
export class MovementService {
  constructor(
    private readonly locationService: LocationService,
    private readonly playerStateService: PlayerStateService,
    private readonly socketService: SocketService,
    private readonly pathFindingService: PathFindingService,
    private readonly spatialGridService: SpatialGridService<
      LiveCharacter | RuntimeMob
    >,
    private readonly interactionService: InteractionService,
    private readonly runtimeMobService: RuntimeMobService,
  ) {}

  private readonly charactersMovementQueues = new Map<
    string,
    CharacterMovementQueue
  >();
  private readonly mobsMovementQueues = new Map<string, MobMovementQueue>();

  public async requestMoveTo(client: Socket, input: RequestMoveToDto) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.onDisconnect(client);
      this.socketService.notifyDisconnection(client);
      return;
    }

    console.log('requestMoveTo', input);

    const { characterId } = client.userData;

    const character = this.playerStateService.getCharacterState(characterId);

    if (!character) return;

    character.isAttacking = false;

    const findLocation = await this.locationService.loadLocation(
      character.locationId,
    );

    if (!findLocation) return;
    const map = findLocation?.passableMap;

    if (!map) {
      // FIXME: this.notifyDisconnection(client, 'Location not found');
      client.disconnect();
      return;
    }

    const isPermissible = map[input.targetY][input.targetX] === 1;

    if (!isPermissible) return;

    const steps = await this.pathFindingService.getPlayerPath(
      character.locationId,
      {
        x: Math.floor(character.x / findLocation.tileWidth),
        y: Math.floor(character.y / findLocation.tileHeight),
      },
      { x: input.targetX, y: input.targetY },
      findLocation.tileWidth,
      map,
    );

    this.interactionService.deletePendingInteraction(character.id);
    this.charactersMovementQueues.set(characterId, {
      steps,
      userId: character.userId,
    });
  }

  public tickMovement() {
    const updatesByLocation = new Map<string, BatchUpdateMovement[]>();
    const charactersEntries = Array.from(
      this.charactersMovementQueues.entries(),
    );
    // FIXME: add payer walk speed field to entity
    const PLAYER_SPEED = 450;

    charactersEntries.forEach(([characterId, { steps, userId }]) => {
      const character = this.playerStateService.getCharacterState(characterId);
      if (!character) return;

      const now = Date.now();

      if (now - character.lastMoveAt < PLAYER_SPEED) return;

      const pathStep = steps.shift();

      if (!pathStep) return;

      const socketId = this.socketService.getSocketId(userId);
      if (!socketId) return;
      const client = this.socketService.getSocket(socketId);

      if (!client) return;

      if (!this.socketService.verifyUserDataInSocket(client)) {
        // FIXME: this.notifyDisconnection(client) ;
        client.disconnect();
        return;
      }

      const prevPosition = client.userData.position;
      const locationId = character.locationId;

      const position = {
        // FIXME: change 32 to tileSize
        x: Math.floor(pathStep.x * 32),
        y: Math.floor(pathStep.y * 32),
      };

      client.userData = { ...client.userData, position };
      this.playerStateService.moveTo(character, position, now);

      if (prevPosition) {
        this.spatialGridService.update(
          character,
          character.locationId,
          prevPosition.x,
          prevPosition.y,
        );
      } else {
        this.spatialGridService.add(character);
      }

      const direction = getDirection(prevPosition, position);

      // let updates = updatesByLocation.get(locationId);
      // if (!updates) {
      //   updates = [];
      //   updatesByLocation.set(locationId, updates);
      // }

      const updates = this.getOrCreateBatchUpdate(
        locationId,
        updatesByLocation,
      );

      updates.push({
        characterId,
        locationId,
        x: position.x,
        y: position.y,
        direction,
        type: 'player',
      });

      if (steps.length === 0) {
        this.charactersMovementQueues.delete(characterId);
      }
    });

    const mobsEntries = Array.from(this.mobsMovementQueues.entries());
    for (const [id, { steps }] of mobsEntries) {
      const runtimeMob = this.runtimeMobService.getById(id);

      if (!runtimeMob) {
        this.mobsMovementQueues.delete(id);
        return;
      }

      if (runtimeMob.mob.respawnIn) return;
      const now = Date.now();

      const moveSpeed = runtimeMob.mob.isAttacking
        ? runtimeMob.mob.chaseSpeed
        : runtimeMob.mob.walkSpeed;

      if (now - runtimeMob.mob.lastMoveAt < moveSpeed) return;

      const step = steps.shift();

      if (!step) {
        this.mobsMovementQueues.delete(id);
        return;
      }

      const locationId = runtimeMob.locationId;

      const prevPosition = {
        x: runtimeMob.x,
        y: runtimeMob.y,
      };

      const movedMob = this.runtimeMobService.moveTo(runtimeMob, step, now);

      const currentPosition = {
        x: Math.floor(movedMob.x * 32),
        y: Math.floor(movedMob.y * 32),
      };

      const direction = getDirection(prevPosition, currentPosition);

      const updates = this.getOrCreateBatchUpdate(
        locationId,
        updatesByLocation,
      );

      updates.push({
        locationId,
        direction,
        x: movedMob.x,
        y: movedMob.y,
        type: 'mob',
        spawnMobId: runtimeMob.id,
      });
    }

    for (const [locationId, updates] of updatesByLocation.entries()) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.MovementBath,
        updates,
      );
    }
  }

  private getOrCreateBatchUpdate(
    locationId: string,
    updatesByLocation: Map<string, BatchUpdateMovement[]>,
  ) {
    let updates = updatesByLocation.get(locationId);
    if (!updates) {
      updates = [];
      updatesByLocation.set(locationId, updates);
    }

    return updates;
  }

  public setMovementQueue(characterId: string, data: CharacterMovementQueue) {
    return this.charactersMovementQueues.set(characterId, data);
  }

  public getMovementQueue(characterId: string) {
    return this.charactersMovementQueues.get(characterId);
  }

  public deleteMovementQueue(characterId: string) {
    return this.charactersMovementQueues.delete(characterId);
  }
}
