import { Injectable } from '@nestjs/common';

import type { PlayerSession } from '../../domain/entities/player-session.entity';
import type { PlayerSessionRepositoryPort } from '../../domain/ports/in-memory-player-session-repository.port';

@Injectable()
export class InMemoryPlayerSessionRepository implements PlayerSessionRepositoryPort {
  private readonly sessions = new Map<string, PlayerSession>();

  public save(session: PlayerSession): void {
    this.sessions.set(session.getId(), session);
  }

  public findByCharacterId(characterId: string): PlayerSession | null {
    return this.sessions.get(characterId) ?? null;
  }

  public remove(characterId: string): void {
    this.sessions.delete(characterId);
  }

  public findAll(): PlayerSession[] {
    return Array.from(this.sessions.values());
  }
}
