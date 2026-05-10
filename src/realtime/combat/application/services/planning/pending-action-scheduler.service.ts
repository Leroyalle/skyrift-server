import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { SkillType } from 'src/realtime/skill-session';

import { Inject, Injectable } from '@nestjs/common';

import { actionRules } from '../../../domain/constants/action-rules.constant';
import type { ActionQueueRepositoryPort } from '../../../domain/ports/action-queue-repository.port';
import type { PendingAction } from '../../../domain/types/action-queue.type';
import { ACTION_QUEUE_REPOSITORY_TOKEN } from '../../ports/tokens';

@Injectable()
export class PendingActionSchedulerService {
  constructor(
    @Inject(ACTION_QUEUE_REPOSITORY_TOKEN)
    private readonly actionQueueRepository: ActionQueueRepositoryPort,
  ) {}

  public execute(entityRef: IEntityRef, pendingAction: PendingAction, skillType?: SkillType): void {
    const queue = this.actionQueueRepository.get(entityRef);

    const hasAuto = queue.find(action => action.actionType === 'autoAttack');

    if (hasAuto && !skillType) return;

    if (hasAuto) {
      queue.splice(-1, 0, pendingAction);
      return;
    }

    if (this.shouldChainAutoAttack(skillType)) {
      queue.push(pendingAction, this.createAutoAttackFollowUp(pendingAction));
      return;
    }

    queue.push(pendingAction);
  }

  private shouldChainAutoAttack(skillType?: SkillType): boolean {
    if (!skillType) return false;

    return actionRules[skillType].chainAutoAttack;
  }

  private createAutoAttackFollowUp(pendingAction: PendingAction): PendingAction {
    return {
      ...pendingAction,
      actionType: 'autoAttack',
      skillId: null,
    };
  }
}
