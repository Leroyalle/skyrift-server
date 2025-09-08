import { Injectable } from '@nestjs/common';
import { PlayerStateService } from 'src/game/services/player-state/player-state.service';
import { LocationService } from 'src/location/location.service';
import { SocketService } from '../socket/socket.service';
import { RequestMoveToDto } from 'src/game/dto/request-move-to.dto';
import { Socket } from 'socket.io';
import { TBatchUpdateMovement } from 'src/game/types/batch-update/batch-update-movement.type';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { getDirection } from 'src/game/lib/get-direction.lib';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { MovementQueue } from './types/movement-queue.type';
import { PathFindingService } from '../path-finding/path-finding.service';
import { InteractionService } from '../interaction/interaction.service';

@Injectable()
export class MovementService {
  constructor(
    private readonly locationService: LocationService,
    private readonly playerStateService: PlayerStateService,
    private readonly socketService: SocketService,
    private readonly pathFindingService: PathFindingService,
    private readonly spatialGridService: SpatialGridService<LiveCharacterState>,
    private readonly interactionService: InteractionService,
  ) {}

  private readonly movementQueues = new Map<string, MovementQueue>();

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
    this.movementQueues.set(characterId, { steps, userId: character.userId });
  }

  public tickMovement() {
    const updatesByLocation = new Map<string, TBatchUpdateMovement[]>();
    const entries = Array.from(this.movementQueues.entries());

    entries.forEach(([characterId, { steps, userId }]) => {
      const character = this.playerStateService.getCharacterState(characterId);
      if (!character) return;

      const now = Date.now();

      if (now - character.lastMoveAt < 450) return;

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

      let updates = updatesByLocation.get(locationId);
      if (!updates) {
        updates = [];
        updatesByLocation.set(locationId, updates);
      }

      updates.push({
        characterId,
        locationId,
        x: position.x,
        y: position.y,
        direction,
      });

      if (steps.length === 0) {
        this.movementQueues.delete(characterId);
      }
    });
    for (const [locationId, updates] of updatesByLocation.entries()) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.PlayerWalkBatch,
        updates,
      );
    }
  }

  public setMovementQueue(characterId: string, data: MovementQueue) {
    return this.movementQueues.set(characterId, data);
  }

  public getMovementQueue(characterId: string) {
    return this.movementQueues.get(characterId);
  }

  public deleteMovementQueue(characterId: string) {
    return this.movementQueues.delete(characterId);
  }
}
