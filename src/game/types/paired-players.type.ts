import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { PendingAction } from './pending-actions.type';

export type PairedPlayers = {
  victim: LiveCharacterState;
  attacker: LiveCharacterState;
  action: PendingAction;
};
