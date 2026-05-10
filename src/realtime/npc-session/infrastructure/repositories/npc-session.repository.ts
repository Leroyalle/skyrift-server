import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import { Injectable } from '@nestjs/common';

import type { NpcSession } from '../../domain/entities/npc.entity';
import type { NpcSessionRepositoryPort } from '../../domain/ports/npc-session-repository.port';

@Injectable()
export class NpcSessionRepository implements NpcSessionRepositoryPort {
  private readonly sessions = new Map<string, NpcSession>();
  private readonly locationIdToSessionIds = new Map<string, Set<string>>();

  public save(session: NpcSession): void {
    this.sessions.set(session.id, session);
    const sessionsSet = getOrCreate(
      this.locationIdToSessionIds,
      session.locationId,
      () => new Set(),
    );
    sessionsSet.add(session.id);
  }

  public findById(characterId: string): NpcSession | null {
    return this.sessions.get(characterId) ?? null;
  }

  public remove(characterId: string): void {
    const character = this.findById(characterId);
    if (!character) return;
    this.sessions.delete(characterId);
    this.locationIdToSessionIds.get(character.locationId)?.delete(characterId);
  }

  public findAll(): NpcSession[] {
    return Array.from(this.sessions.values());
  }

  public findByIds(ids: string[]): NpcSession[] {
    return ids.map(id => this.findById(id)).filter((s): s is NpcSession => !!s);
  }

  public getByLocationId(locationId: string): NpcSession[] {
    const sessionIds = this.locationIdToSessionIds.get(locationId);
    if (!sessionIds) return [];
    return this.findByIds(Array.from(sessionIds));
  }

  public update(npc: NpcSession): void {
    this.sessions.set(npc.id, npc);
  }

  public getIterable(): Iterable<NpcSession> {
    return this.sessions.values();
  }
}
