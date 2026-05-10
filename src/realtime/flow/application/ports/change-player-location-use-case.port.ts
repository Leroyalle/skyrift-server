import type { PlayerSessionSnapshot } from 'src/realtime/player-session';

export type ChangePlayerLocationInput = {
  character: PlayerSessionSnapshot;
  targetLocationId: string;
  targetX: number;
  targetY: number;
};

export interface ChangePlayerLocationPort {
  execute(payload: ChangePlayerLocationInput): Promise<void>;
}
