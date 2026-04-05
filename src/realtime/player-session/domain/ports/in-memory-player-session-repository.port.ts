import type { PlayerSession } from '../entities/player-session.entity';

export interface PlayerSessionRepositoryPort {
  save(session: PlayerSession): void;
  findById(characterId: string): PlayerSession | null;
  findAll(): PlayerSession[];
  remove(characterId: string): void;
}
