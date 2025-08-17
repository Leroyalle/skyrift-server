import { ActionType } from '../pending-actions.type';

export type BatchUpdateAction = {
  targets: {
    characterId: string;
    hp: number;
    isAlive: boolean;
    receivedDamage: number;
  }[];
  type: ActionType;
  skillId: string | null;
};
