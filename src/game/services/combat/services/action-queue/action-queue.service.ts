import { Injectable } from '@nestjs/common';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';
import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';
import { actionRules } from './constants/action-rules.constants';

@Injectable()
export class ActionQueueService {
  constructor() {}

  private readonly pendingActionsQueue: Map<EntityKey, PendingAction[]> =
    new Map();

  public getPendingAction(entityRef: EntityRef) {
    const entityKey = generateEntityKey(entityRef);
    return this.pendingActionsQueue.get(entityKey);
  }

  public setPendingAction(entityRef: EntityRef, pendingAction: PendingAction) {
    const entityKey = generateEntityKey(entityRef);
    const queue = this.getOrCreateActionQueue(entityKey);
    return queue.push(pendingAction);
  }

  public shiftPendingAction(entityRef: EntityRef) {
    const key = generateEntityKey(entityRef);
    const queue = this.getOrCreateActionQueue(key);
    return queue.shift();
  }

  public clearPendingActions(entityRef: EntityRef, queue?: []): boolean {
    const entityKey = generateEntityKey(entityRef);
    if (queue) {
      this.pendingActionsQueue.set(entityKey, queue);
      return true;
    }
    return this.pendingActionsQueue.delete(entityKey);
  }

  public getIterablePendingActions() {
    return Array.from(this.pendingActionsQueue.values());
  }

  private getOrCreateActionQueue(key: EntityKey) {
    let queue = this.pendingActionsQueue.get(key);
    if (!queue) {
      queue = [];
      this.pendingActionsQueue.set(key, queue);
    }
    return queue;
  }

  public findActionType(entityRef: EntityRef, actionType: ActionType) {
    const entityKey = generateEntityKey(entityRef);
    const queue = this.getOrCreateActionQueue(entityKey);

    return queue.some((q) => q.actionType === actionType);
  }

  public pushPendingAction(
    queue: PendingAction[],
    hasAutoAttack: boolean,
    pendingAction: PendingAction,
    characterSkill?: CharacterSkill,
  ) {
    if (hasAutoAttack) {
      queue.splice(-1, 0, pendingAction);
      return;
    }
    const chainAuto = characterSkill
      ? actionRules[characterSkill.skill.type].chainAutoAttack
      : false;

    if (chainAuto) {
      queue.push(pendingAction, {
        ...pendingAction,
        actionType: ActionType.AutoAttack,
        skillId: null,
      });
    } else {
      queue.push(pendingAction);
    }
  }
}
