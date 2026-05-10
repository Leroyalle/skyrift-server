import { CombatTargetingPolicy } from 'src/realtime/combat/domain/polices/combat-targeting.policy';
import type { ActionQueueRepositoryPort } from 'src/realtime/combat/domain/ports/action-queue-repository.port';
import type { PendingAction } from 'src/realtime/combat/domain/types/action-queue.type';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
  type EntitySnapshot,
} from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import { MOVEMENT_QUEUE_FACADE_TOKEN, type MovementQueueFacadePort } from 'src/realtime/movement';
import { PATH_FINDING_SERVICE, type PathFindingServicePort } from 'src/realtime/path-finding';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type {
  CombatActionPlannerPayload,
  CombatActionPlannerPort,
} from '../../ports/combat-action-planner.port';
import { ACTION_QUEUE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { PendingActionSchedulerService } from './pending-action-scheduler.service';

type ResolveTargetResult = {
  tile: IPositionTile;
  currentTarget: EntitySnapshot | null;
} | null;

@Injectable()
export class CombatActionPlannerService implements CombatActionPlannerPort {
  constructor(
    @Inject(PATH_FINDING_SERVICE) private readonly pathFindingService: PathFindingServicePort,
    @Inject(ACTION_QUEUE_REPOSITORY_TOKEN)
    private readonly actionQueueRepository: ActionQueueRepositoryPort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(MOVEMENT_QUEUE_FACADE_TOKEN)
    private readonly movementQueueFacade: MovementQueueFacadePort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    private readonly pendingActionScheduler: PendingActionSchedulerService,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReaderFacade: LocationReaderPort,
  ) {}

  public async execute(payload: CombatActionPlannerPayload) {
    const attacker = this.entityResolver.getByRef(payload.attackerRef);

    if (!attacker) return;

    const location = this.locationReaderFacade.getById(attacker.position.locationId);

    if (!location) return;

    const skillSpec = payload.skillId
      ? this.entityActionFacade.getSkillCombatData(
          {
            id: attacker.id,
            type: attacker.type,
          },
          payload.skillId,
        )
      : null;

    const target = this.resolveTarget(payload.target, location.size.tileWidth);

    if (!target) return;

    if (!this.canAttackResolvedTarget(attacker, target.currentTarget)) return;

    if (target.currentTarget) {
      this.entityActionFacade.setCurrentTarget(attacker, target.currentTarget);
    }

    this.actionQueueRepository.clear(attacker);

    const steps = await this.pathFindingService.getPath(
      location.id,
      getTileByPosition(attacker.position.x, attacker.position.y, location.size.tileWidth),
      target.tile,
      location.passableMap,
    );

    if (!this.hasPath(steps)) return;

    const pendingAction: PendingAction = {
      actionType: payload.skillId ? 'skill' : 'autoAttack',
      attackerRef: payload.attackerRef,
      target: payload.target,
      skillId: payload.skillId,
      state: 'wait-path',
    };

    const range = skillSpec ? skillSpec.range : attacker.baseStats.attackRange;

    this.resolvePendingActionState(attacker, pendingAction, range, steps);
    this.pendingActionScheduler.execute(
      payload.attackerRef,
      pendingAction,
      skillSpec ? skillSpec.type : undefined,
    );
  }

  private resolveTarget(
    target: CombatActionPlannerPayload['target'],
    tileSize: number,
  ): ResolveTargetResult | null {
    if (target.kind === 'target') {
      const victim = this.entityResolver.getByRef(target.value);
      if (!victim) return null;
      return {
        currentTarget: victim,
        tile: getTileByPosition(victim.position.x, victim.position.y, tileSize),
      };
    } else if (target.kind === 'aoe') {
      return {
        currentTarget: null,
        tile: getTileByPosition(target.value.x, target.value.y, tileSize),
      };
    }
    return null;
  }

  private resolvePendingActionState(
    attacker: EntitySnapshot,
    pendingAction: PendingAction,
    range: number,
    steps: IPositionTile[],
  ) {
    const inRange = steps.length <= range;
    if (!inRange) {
      this.movementQueueFacade.set(attacker, { steps });
      this.entityActionFacade.setState({ entityRef: attacker, state: { current: 'pursue' } });
      pendingAction.state = 'move-to-target';
    } else {
      this.movementQueueFacade.remove(attacker);
      this.entityActionFacade.setState({ entityRef: attacker, state: { current: 'attacking' } });
      pendingAction.state = 'attack';
    }
  }

  private canAttackResolvedTarget(
    attacker: EntitySnapshot,
    victim: EntitySnapshot | null,
  ): boolean {
    if (!victim) return true;

    return CombatTargetingPolicy.canHit(
      // TODO: вытащить фракцию сущности
      { id: attacker.id, type: attacker.type, faction: 'CrimsonCoven' },
      { id: victim.id, type: victim.type, faction: 'Silverleaf' },
    );
  }

  private hasPath(steps: IPositionTile[] | null | undefined): steps is IPositionTile[] {
    return !!steps && steps.length > 0;
  }
}
