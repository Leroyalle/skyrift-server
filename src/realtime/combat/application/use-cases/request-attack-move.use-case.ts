import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { ActionQueueRepositoryPort } from '../../domain/ports/action-queue-repository.port';
import type { CombatActionPlannerPort } from '../ports/combat-action-planner.port';
import type { RequestAttackMoveUseCasePort } from '../ports/request-attack-move-use-case.port';
import { ACTION_QUEUE_REPOSITORY_TOKEN, COMBAT_ACTION_PLANNER_TOKEN } from '../ports/tokens';

interface Payload {
  attackerRef: IEntityRef;
  victimRef: IEntityRef;
}

@Injectable()
export class RequestAttackMoveUseCase implements RequestAttackMoveUseCasePort {
  constructor(
    @Inject(COMBAT_ACTION_PLANNER_TOKEN)
    private readonly combatActionPlanner: CombatActionPlannerPort,
    @Inject(ACTION_QUEUE_REPOSITORY_TOKEN)
    private readonly actionQueueRepository: ActionQueueRepositoryPort,
  ) {}

  public async execute(payload: Payload) {
    const queue = this.actionQueueRepository.get(payload.attackerRef);

    const hasAuto = queue.find(action => action.actionType === 'autoAttack');

    if (hasAuto) return;

    return await this.combatActionPlanner.execute({
      attackerRef: payload.attackerRef,
      target: { kind: 'target', value: payload.victimRef },
      skillId: null,
    });
  }
}
