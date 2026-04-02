import { isMob } from 'src/realtime/contracts/lib/guards/is-mob.lib';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';
import { PATH_FINDING_SERVICE, type PathFindingServicePort } from 'src/realtime/path-finding';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { decodeEntityKey } from 'src/realtime/shared/lib/helpers/decode-entity-key.helper';
import { getDirection } from 'src/realtime/shared/lib/helpers/get-direction.lib';
import { getPixelByTile } from 'src/realtime/shared/lib/helpers/get-pixels-by-tile.lib';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';
import { SPATIAL_GRID_INDEX_TOKEN, type SpatialGridIndexPort } from 'src/realtime/spatial-grid';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryMovementQueueRepositoryPort } from '../../domain/ports/in-memory-movement-queue-repository.port';
import type { BatchUpdateMovement } from '../../domain/types/batch-update-movement.type';
import { IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY } from '../ports/tokens';

@Injectable()
export class ProcessMovementTickUseCase {
  constructor(
    @Inject(IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY)
    private readonly movementQueueRepository: InMemoryMovementQueueRepositoryPort,
    @Inject(PATH_FINDING_SERVICE)
    private readonly pathFindingService: PathFindingServicePort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(SPATIAL_GRID_INDEX_TOKEN) private readonly spatialGridIndex: SpatialGridIndexPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
  ) {}

  public execute() {
    const updatesByLocation = new Map<string, BatchUpdateMovement[]>();

    const entries = this.movementQueueRepository.getAllIterable();

    entries.forEach(([entityKey, queue]) => {
      const entityRef = decodeEntityKey(entityKey);
      const entity = this.entityResolver.getByRef(entityRef);

      if (!entity) return;

      let speed: number | undefined = entity.baseStats.walkSpeed;

      if (isMob(entity)) {
        speed = entity.combat.isAttacking
          ? entity.baseStats.chaseSpeed
          : entity.baseStats.walkSpeed;
      }

      const now = this.clockService.nowMs();

      if (now - entity.combat.lastMoveAt < speed) return;

      // TODO: добавить проверку на стан
      // const hasStun = this.runtimeEffectService.findByType(
      //   {
      //     type: entity.type,
      //     id: entity.id,
      //   },
      //   EffectType.Stun,
      // );

      // if (hasStun && hasStun.length) return;

      const pathStep = queue.steps.shift();

      if (!pathStep) return;

      const pixelPosition = getPixelByTile(pathStep);

      const prevPosition: IPositionTile = { x: entity.position.x, y: entity.position.y };
      this.entityActionFacade.move(entityRef, pixelPosition, now);

      this.spatialGridIndex.update(
        {
          id: entity.id,
          type: entity.type,
          locationId: entity.position.locationId,
          x: prevPosition.x,
          y: prevPosition.y,
        },
        entity.position.locationId,
        prevPosition.x,
        prevPosition.y,
      );

      const direction = getDirection(prevPosition, pixelPosition);

      const updates = this.getOrCreateBatchUpdate(entity.position.locationId, updatesByLocation);

      updates.push({
        // TODO: объединить в удобные объекты типо entityRef / position / combat
        id: entity.id,
        type: entity.type,
        locationId: entity.position.locationId,
        to: { x: pixelPosition.x, y: pixelPosition.y },
        from: { x: prevPosition.x, y: prevPosition.y },
        isFinalStep: queue.steps.length === 0,
        moveDuration: speed,
        lastMoveAt: entity.combat.lastMoveAt,
        direction,
      });
    });

    return updatesByLocation;

    // for (const [locationId, updates] of updatesByLocation.entries()) {
    //   this.socketService.sendTo(
    //     RedisKeys.Location + locationId,
    //     ServerToClientEvents.MovementBatch,
    //     updates,
    //   );
    // }
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
