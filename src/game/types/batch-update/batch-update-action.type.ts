import { ActionType } from '../pending-actions.type';

export type BatchUpdateAction = {
  characterId: string;
  hp: number;
  isAlive: boolean;
  receivedDamage: number;
  type: ActionType;
  skillId: string | null;
};
