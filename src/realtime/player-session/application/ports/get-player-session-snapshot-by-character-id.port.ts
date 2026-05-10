import type { PlayerSessionSnapshot } from '../../domain/types/player-session.type';

export interface GetPlayerSessionSnapshotByCharacterIdPort {
  execute(characterId: string): PlayerSessionSnapshot | null;
}
