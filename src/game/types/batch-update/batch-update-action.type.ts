import { EntityType } from '../entity/entity-type.type';
import { ActionType } from '../pending-actions.type';

export type BatchUpdateAction = {
  targets: Target[];
  type: ActionType;
  skillId: string | null;
};

export type Target = {
  id: string;
  type: EntityType;
  hp: number;
  isAlive: boolean;
  receivedDamage: number;
};
