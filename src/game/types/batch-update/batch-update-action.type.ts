import { EntityRef } from '../entity/entity-ref.type';
import { ActionType } from '../pending-actions.type';

export interface BatchUpdateAction {
  targets: Target[];
  type: ActionType;
  skillId: string | null;
}

export interface Target extends EntityRef {
  hp: number;
  isAlive: boolean;
  receivedDamage: number;
}
