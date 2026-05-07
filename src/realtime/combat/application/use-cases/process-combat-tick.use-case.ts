import { isPlayer } from 'src/realtime/contracts/lib/guards/is-player.lib';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import { MOVEMENT_QUEUE_FACADE_TOKEN, type MovementQueueFacadePort } from 'src/realtime/movement';
import { PATH_FINDING_SERVICE, type PathFindingServicePort } from 'src/realtime/path-finding';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { ActionQueueRepositoryPort } from '../../domain/ports/action-queue-repository.port';
import type { BatchUpdateAction } from '../../domain/types/batch-update-action.type';
import type { ActionResolverServicePort } from '../ports/action-resolver-service.port';
import type { ProcessCombatTickPort } from '../ports/process-combat-tick.port';
import { ACTION_QUEUE_REPOSITORY_TOKEN, ACTION_RESOLVER_TOKEN } from '../ports/tokens';

@Injectable()
export class ProcessCombatTickUseCase implements ProcessCombatTickPort {
  constructor(
    @Inject(ACTION_QUEUE_REPOSITORY_TOKEN)
    private readonly actionQueueRepository: ActionQueueRepositoryPort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(PATH_FINDING_SERVICE) private readonly pathFindingService: PathFindingServicePort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private entityActionFacade: EntityActionFacadePort,
    @Inject(MOVEMENT_QUEUE_FACADE_TOKEN)
    private readonly movementQueueFacade: MovementQueueFacadePort,
    @Inject(ACTION_RESOLVER_TOKEN)
    private readonly actionResolverService: ActionResolverServicePort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
  ) {}

  public async execute() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    const queues = this.actionQueueRepository.getAllIterable();

    for (const queue of queues) {
      if (queue.length === 0) continue;
      const action = queue[0];

      const now = this.clockService.nowMs();

      const attacker = this.entityResolver.getByRef(action.attackerRef);

      if (!attacker) continue;

      const location = this.locationReader.getById(attacker.position.locationId);

      if (!location) continue;

      const attackerTile = getTileByPosition(
        attacker.position.x,
        attacker.position.y,
        location.size.tileWidth,
      );

      let targetTile: IPositionTile | null = null;

      if (action.target.kind === 'target') {
        const victim = this.entityResolver.getByRef(action.target.value);

        if (!victim) continue;

        targetTile = getTileByPosition(
          victim.position.x,
          victim.position.y,
          location.size.tileWidth,
        );
      } else if (action.target.kind === 'aoe') {
        targetTile = getTileByPosition(
          action.target.value.x,
          action.target.value.y,
          location.size.tileWidth,
        );
      }

      if (!targetTile) continue;

      // TODO: каждый тик дешево проверять расстояние между attackerTile и targetTile
      // pathfinding пересчитывать только если targetTile !== lastTargetTile

      const steps = await this.pathFindingService.getPath(
        attacker.position.locationId,
        attackerTile,
        targetTile,
        location.passableMap,
      );

      if (!steps) {
        this.actionQueueRepository.clear(attacker);
        continue;
      }

      const skill = action.skillId
        ? this.entityActionFacade.getSkillCombatData(attacker, action.skillId)
        : null;

      const range = skill ? skill.range : attacker.baseStats.attackRange;

      if (steps.length > range) {
        this.movementQueueFacade.set(attacker, { steps });
        this.entityActionFacade.setState({
          entityRef: attacker,
          state: { current: 'pursue' },
        });
        continue;
      } else {
        this.movementQueueFacade.remove(attacker);
        this.entityActionFacade.setState({
          entityRef: attacker,
          state: { current: 'attacking' },
        });
        if (action.target.kind === 'target') {
          this.entityActionFacade.setCurrentTarget(
            { id: attacker.id, type: attacker.type },
            action.target.value,
          );
        }
      }

      const batchLocation = getOrCreate(updatesByLocation, location.id, () => []);

      this.actionResolverService.execute({
        action: { actionType: action.actionType, skill },
        attacker: {
          attackSpeed: attacker.baseStats.attackSpeed,
          lastAttackAt: attacker.combat.lastAttackAt,
          position: attacker.position,
          id: attacker.id,
          type: attacker.type,
          userId: isPlayer(attacker) ? attacker.userId : null,
        },
        batchLocation,
        context: {
          now,
          removeAction: () => queue.shift(),
          tileSize: location.size.tileWidth,
        },
        target: action.target,
      });
    }
  }
}
