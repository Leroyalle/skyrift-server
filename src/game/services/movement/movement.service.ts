import { Injectable } from '@nestjs/common';
import { PlayerStateService } from 'src/game/services/characters/player-state/player-state.service';
import { LocationService } from 'src/world/location/location.service';
import { SocketService } from '../socket/socket.service';
import { RequestMoveToDto } from 'src/game/dto/request-move-to.dto';
import { Socket } from 'socket.io';
import { BatchUpdateMovement } from 'src/game/types/batch-update/batch-update-movement.type';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { getDirection } from 'src/game/lib/helpers/get-direction.lib';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { PathFindingService } from '../path-finding/path-finding.service';
import { InteractionService } from '../interaction/interaction.service';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { isPlayer } from '../combat/lib/entity/guards/is-player.lib';
import { isMob } from '../combat/lib/entity/guards/is-mob.lib';
import { getPixelByTile } from 'src/game/lib/helpers/get-pixels-by-tile.lib';
import { RuntimeEffectService } from '../runtime-effect/runtime-effect.service';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';
import { MovementQueueService } from './services/movement-queue/movement-queue.service';
import { decodeEntityKey } from 'src/game/lib/entity/decode-entity-key.lib';
import { isCharacterMovementQueue } from './services/movement-queue/lib/guards/is-character-movement-queue.lib';
import { RuntimeMobService } from '../characters/runtime-mob/runtime-mob.service';
import { EntityRegistryService } from '../entity-registry/entity-registry.service';
import { AuthenticatedSocket } from 'src/common/types/socket/auth-socket.type';

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
    private readonly movementQueueService: MovementQueueService,
    private readonly registryService: EntityRegistryService,
  ) {}

  public async requestMoveTo(client: AuthenticatedSocket, input: RequestMoveToDto) {
    console.log('requestMoveTo', input);

    const { characterId } = client.userData;

    const character = this.playerStateService.getCharacterState(characterId);

    if (!character) return;

    character.isAttacking = false;

    const findLocation = await this.locationService.loadLocation(character.locationId);

    if (!findLocation) return;
    const map = findLocation?.passableMap;

    if (!map) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
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
    this.movementQueueService.set({ id: characterId, type: 'player' }, steps);
  }

  public tickMovement() {
    const updatesByLocation = new Map<string, BatchUpdateMovement[]>();

    const entries = this.movementQueueService.getIterableMovementQueues;

    entries.forEach(([entityKey, queue]) => {
      const entityRef = decodeEntityKey(entityKey);
      const entity = this.registryService.getByRef(entityRef);

      if (!entity) return;

      let speed: number | undefined = entity.walkSpeed;

      if (isMob(entity)) {
        speed = entity.isAttacking ? entity.chaseSpeed : entity.walkSpeed;
      }

      const now = Date.now();

      if (now - entity.lastMoveAt < speed) return;

      const hasStun = this.runtimeEffectService.findByType(
        {
          type: entity.type,
          id: entity.id,
        },
        EffectType.Stun,
      );

      if (hasStun && hasStun.length) return;

      const pathStep = queue.steps.shift();

      if (!pathStep) return;

      const pixelPosition = getPixelByTile(pathStep);
      if (isCharacterMovementQueue(entityRef, queue)) {
        const socket = this.socketService.getSocketByUserId(queue.userId);
        if (!socket) return;
        if (!this.socketService.verifyUserDataInSocket(socket)) {
          this.socketService.notifyDisconnection(socket);
          socket.disconnect();
          return;
        }
        socket.userData = { ...socket.userData, position: pixelPosition };
      }

      const prevPosition: PositionDto = { x: entity.x, y: entity.y };

      if (isPlayer(entity)) {
        this.playerStateService.moveTo(entity, pixelPosition, now);
      } else if (isMob(entity)) {
        this.runtimeMobService.moveTo(entity, pixelPosition, now);
      }

      // if (prevPosition) {
      this.spatialGridService.update(entity, entity.locationId, prevPosition.x, prevPosition.y);
      // } else {
      // this.spatialGridService.add(entity);
      // }

      const direction = getDirection(prevPosition, pixelPosition);

      const updates = this.getOrCreateBatchUpdate(entity.locationId, updatesByLocation);

      updates.push({
        id: entity.id,
        locationId: entity.locationId,
        to: { x: pixelPosition.x, y: pixelPosition.y },
        from: { x: prevPosition.x, y: prevPosition.y },
        isFinalStep: queue.steps.length === 0,
        moveDuration: speed,
        lastMoveAt: entity.lastMoveAt,
        direction,
        type: entity.type,
      });

      if (queue.steps.length === 0) {
        this.movementQueueService.delete(entityRef);
      }
    });

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
}
