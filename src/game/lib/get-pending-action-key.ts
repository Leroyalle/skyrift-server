import { ActionType } from 'src/game/types/pending-actions.type';

export function getPendingActionKey(
  attackerId: string,
  victimId: string,
  type: ActionType,
) {
  return `${attackerId}_${victimId}_${type}}`;
}
