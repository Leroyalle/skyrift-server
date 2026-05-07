import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import { Injectable } from '@nestjs/common';

import type { PlayerSession } from '../../domain/entities/player-session.entity';
import type { PlayerSessionRepositoryPort } from '../../domain/ports/in-memory-player-session-repository.port';

@Injectable()
export class InMemoryPlayerSessionRepository implements PlayerSessionRepositoryPort {
  private readonly sessions = new Map<string, PlayerSession>();
  private readonly locationIdToSessionIds = new Map<string, Set<string>>();

  public save(session: PlayerSession): void {
    this.sessions.set(session.id, session);
    const sessionsSet = getOrCreate(
      this.locationIdToSessionIds,
      session.locationId,
      () => new Set(),
    );
    sessionsSet.add(session.id);
  }

  public findById(characterId: string): PlayerSession | null {
    return this.sessions.get(characterId) ?? null;
  }

  public remove(characterId: string): void {
    const character = this.findById(characterId);
    if (!character) return;
    this.sessions.delete(characterId);
    this.locationIdToSessionIds.get(character.locationId)?.delete(characterId);
  }

  public findAll(): PlayerSession[] {
    return Array.from(this.sessions.values());
  }

  public findByIds(ids: string[]): PlayerSession[] {
    return ids.map(id => this.findById(id)).filter((s): s is PlayerSession => !!s);
  }

  public getByLocationId(locationId: string): PlayerSession[] {
    const sessionIds = this.locationIdToSessionIds.get(locationId);
    if (!sessionIds) return [];
    return this.findByIds(Array.from(sessionIds));
  }

  public getIterable(): Iterable<PlayerSession> {
    return this.sessions.values();
  }
}
