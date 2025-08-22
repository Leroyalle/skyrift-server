import { BatchUpdateAction } from '../batch-update/batch-update-action.type';

export type ApplyAutoAttackResult = BatchUpdateAction & {
  victimIsAlive: boolean;
};
