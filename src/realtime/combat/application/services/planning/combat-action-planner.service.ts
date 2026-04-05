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

import type { PendingActionSchedulerService } from './pending-action-scheduler.service';

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
  ) {}

  public async execute(payload: CombatActionPlannerPayload) {
    const attacker = this.entityResolver.getByRef(payload.attackerRef);

    if (!attacker) return;

    // TODO: получать из фасада локации
    const location = {
      x: 1,
      y: 1,
      passableMap: [[1], [2], [3]],
      id: attacker.position.locationId,
      tileWidth: 32,
    };

    if (!location) return;

    const skillSpec = payload.skillId
      ? this.entityActionFacade.getSkillCombatSpec(
          {
            id: attacker.id,
            type: attacker.type,
          },
          payload.skillId,
        )
      : null;

    const target = this.resolveTarget(payload.target, location.tileWidth);

    if (!target) return;

    if (!this.canAttackResolvedTarget(attacker, target.currentTarget)) return;

    // TODO: засеттить атакеру currentTargetRef

    this.actionQueueRepository.clear(attacker);

    const steps = await this.pathFindingService.getPath(
      location.id,
      getTileByPosition(attacker.position.x, attacker.position.y, location.tileWidth),
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
      const victim = this.entityResolver.getByRef(target.victimRef);
      if (!victim) return null;
      return {
        currentTarget: victim,
        tile: getTileByPosition(victim.position.x, victim.position.y, tileSize),
      };
    } else if (target.kind === 'aoe') {
      return {
        currentTarget: null,
        tile: getTileByPosition(target.x, target.y, tileSize),
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
      // TODO: менять стейт через фасад
      // attacker.state = 'pursue';
      pendingAction.state = 'move-to-target';
    } else {
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
      { id: victim.id, type: victim.type, faction: 'CrimsonCoven' },
    );
  }

  private hasPath(steps: IPositionTile[] | null | undefined): steps is IPositionTile[] {
    return !!steps && steps.length > 0;
  }
}
