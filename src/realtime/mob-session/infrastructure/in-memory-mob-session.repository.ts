import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import { Injectable } from '@nestjs/common';

import type { MobSession } from '../domain/entities/mob-session.entity';
import type { MobSessionRepositoryPort } from '../domain/ports/in-memory-mob-session-repository.port';

@Injectable()
export class InMemoryMobSessionRepository implements MobSessionRepositoryPort {
  private readonly sessions = new Map<string, MobSession>();
  private readonly locationIdToSessionIds = new Map<string, Set<string>>();

  public save(session: MobSession): void {
    this.sessions.set(session.id, session);
    const sessionsSet = getOrCreate(
      this.locationIdToSessionIds,
      session.locationId,
      () => new Set(),
    );
    sessionsSet.add(session.id);
  }

  public findById(characterId: string): MobSession | null {
    return this.sessions.get(characterId) ?? null;
  }

  public remove(characterId: string): void {
    const character = this.findById(characterId);
    if (!character) return;
    this.sessions.delete(characterId);
    this.locationIdToSessionIds.get(character.locationId)?.delete(characterId);
  }

  public findAll(): MobSession[] {
    return Array.from(this.sessions.values());
  }

  public findByIds(ids: string[]): MobSession[] {
    return ids.map(id => this.findById(id)).filter((s): s is MobSession => !!s);
  }

  public getByLocationId(locationId: string): MobSession[] {
    const sessionIds = this.locationIdToSessionIds.get(locationId);
    if (!sessionIds) return [];
    return this.findByIds(Array.from(sessionIds));
  }

  public getIterable(): Iterable<MobSession> {
    return this.sessions.values();
  }
}
