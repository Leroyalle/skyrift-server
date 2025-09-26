import { IRuntimeCharacter } from 'src/character/types/runtime-character';
import { PendingAction } from './pending-actions.type';

export type PairedPlayers = {
  victim: IRuntimeCharacter;
  attacker: IRuntimeCharacter;
  action: PendingAction;
};
