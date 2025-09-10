import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { PendingAction } from './pending-actions.type';

export type PairedPlayers = {
  victim: LiveCharacter;
  attacker: LiveCharacter;
  action: PendingAction;
};
