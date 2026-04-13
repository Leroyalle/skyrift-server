import type { PlayerSessionSnapshot } from '../../domain/types/player-session.type';

export interface PlayerSessionReaderPort {
  getByLocationId(locationId: string): PlayerSessionSnapshot[];
}
