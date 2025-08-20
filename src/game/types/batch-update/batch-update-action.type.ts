import { ActionType } from '../pending-actions.type';

export type BatchUpdateAction = {
  targets: Target[];
  type: ActionType;
  skillId: string | null;
};

export type Target = {
  characterId: string;
  hp: number;
  isAlive: boolean;
  receivedDamage: number;
};
