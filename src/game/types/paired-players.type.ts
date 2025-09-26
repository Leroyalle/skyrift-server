import { LiveCharacter } from 'src/character/types/runtime-character';
import { PendingAction } from './pending-actions.type';

export type PairedPlayers = {
  victim: LiveCharacter;
  attacker: LiveCharacter;
  action: PendingAction;
};
