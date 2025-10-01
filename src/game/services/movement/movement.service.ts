import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PlayerStateService } from 'src/game/services/player-state/player-state.service';
import { LocationService } from 'src/location/location.service';
import { SocketService } from '../socket/socket.service';
import { RequestMoveToDto } from 'src/game/dto/request-move-to.dto';
import { Socket } from 'socket.io';
import { BatchUpdateMovement } from 'src/game/types/batch-update/batch-update-movement.type';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { getDirection } from 'src/game/lib/helpers/get-direction.lib';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import {
  CharacterMovementQueue,
  MobMovementQueue,
} from './types/movement-queue.type';
import { PathFindingService } from '../path-finding/path-finding.service';
import { InteractionService } from '../interaction/interaction.service';
import { RuntimeMobService } from '../runtime-mob/runtime-mob.service';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { isPlayer } from '../combat/lib/entity/guards/is-player.lib';
import { isMob } from '../combat/lib/entity/guards/is-mob.lib';
import { getPixelByTile } from 'src/game/lib/helpers/get-pixels-by-tile.lib';
import { RuntimeEffectService } from '../runtime-effect/runtime-effect.service';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';

@Injectable()
export class MovementService {
  constructor(
    private readonly locationService: LocationService,
    private readonly playerStateService: PlayerStateService,
    private readonly socketService: SocketService,
    private readonly pathFindingService: PathFindingService,
    private readonly spatialGridService: SpatialGridService<TRuntimeEntity>,
    private readonly interactionService: InteractionService,
    private readonly runtimeMobService: RuntimeMobService,
    private readonly runtimeEffectService: RuntimeEffectService,
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

    const isPermissible = map?.[input.targetY]?.[input.targetX] === 1;

    if (!isPermissible) return;

    const steps = await this.pathFindingService.getPlayerPath(
      character.locationId,
      {
        x: Math.floor(character.x / findLocation.tileWidth),
        y: Math.floor(character.y / findLocation.tileHeight),
      },
      { x: input.targetX, y: input.targetY },
      map,
    );

    if (!steps) return;

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
    // const PLAYER_SPEED = 450;

    charactersEntries.forEach(([characterId, { steps, userId }]) => {
      const character = this.playerStateService.getCharacterState(characterId);
      if (!character) return;

      const now = Date.now();

      if (now - character.lastMoveAt < character.walkSpeed) return;

      const pathStep = steps.shift();

      if (!pathStep) return;

      const hasStun = this.runtimeEffectService.findByType(
        {
          type: character.type,
          id: character.id,
        },
        EffectType.Stun,
      );

      if (hasStun && hasStun.length) return;

      const socketId = this.socketService.getSocketId(userId);
      if (!socketId) return;
      const client = this.socketService.getSocket(socketId);

      if (!client) return;

      if (!this.socketService.verifyUserDataInSocket(client)) {
        this.socketService.notifyDisconnection(client);
        client.disconnect();
        return;
      }

      const prevPosition = client.userData.position;
      const locationId = character.locationId;

      const pixelPosition = getPixelByTile(pathStep);

      client.userData = { ...client.userData, position: pixelPosition };
      this.playerStateService.moveTo(character, pixelPosition, now);

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

      const direction = getDirection(prevPosition, pixelPosition);

      const updates = this.getOrCreateBatchUpdate(
        locationId,
        updatesByLocation,
      );

      updates.push({
        id: characterId,
        locationId,
        x: pixelPosition.x,
        y: pixelPosition.y,
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
        continue;
      }

      if (runtimeMob.respawnIn || runtimeMob.state === 'attack') continue;

      const now = Date.now();

      const moveSpeed = runtimeMob.isAttacking
        ? runtimeMob.chaseSpeed
        : runtimeMob.walkSpeed;

      if (now - runtimeMob.lastMoveAt < moveSpeed) {
        continue;
      }

      const step = steps.shift();

      if (!step) {
        this.mobsMovementQueues.delete(id);
        continue;
      }

      const locationId = runtimeMob.locationId;

      const prevPosition = {
        x: runtimeMob.x,
        y: runtimeMob.y,
      };

      const pixelPosition = getPixelByTile(step);

      const movedMob = this.runtimeMobService.moveTo(
        runtimeMob,
        pixelPosition,
        now,
      );

      this.spatialGridService.update(
        runtimeMob,
        locationId,
        prevPosition.x,
        prevPosition.y,
      );

      const direction = getDirection(prevPosition, pixelPosition);

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
        id: runtimeMob.id,
      });
    }

    for (const [locationId, updates] of updatesByLocation.entries()) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.MovementBatch,
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

  // public setMovementQueue(data: SetMovementQueueData) {
  //   if (data.type === 'player') {
  //     return this.charactersMovementQueues.set(data.id, data.queue);
  //   } else if (data.type === 'mob') {
  //     return this.mobsMovementQueues.set(data.id, data.queue);
  //   }
  // }
  public setMovementQueue(entity: TRuntimeEntity, steps: PositionDto[]) {
    if (isPlayer(entity)) {
      const queue = {
        steps,
        userId: entity.userId,
      };
      return this.charactersMovementQueues.set(entity.id, queue);
    } else if (isMob(entity)) {
      return this.mobsMovementQueues.set(entity.id, { steps });
    }
  }

  public getMovementQueue(type: EntityType, id: string) {
    if (type === 'player') {
      return this.charactersMovementQueues.get(id);
    } else if (type === 'mob') {
      return this.mobsMovementQueues.get(id);
    }
  }

  public deleteMovementQueue(entity: TRuntimeEntity) {
    if (isPlayer(entity)) {
      return this.charactersMovementQueues.delete(entity.id);
    }
    if (isMob(entity)) {
      return this.mobsMovementQueues.delete(entity.id);
    }
  }
}
