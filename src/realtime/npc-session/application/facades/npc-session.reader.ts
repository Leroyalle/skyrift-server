import { Inject, Injectable } from '@nestjs/common';

import type { NpcSessionRepositoryPort } from '../../domain/ports/npc-session-repository.port';
import type { NpcSessionSnapshot } from '../../domain/types/npc-session.type';
import type { NpcSessionReaderPort } from '../ports/npc-session-reader.port';
import { NPC_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class NpcSessionReader implements NpcSessionReaderPort {
  constructor(
    @Inject(NPC_SESSION_REPOSITORY_TOKEN)
    private readonly npcSessionRepository: NpcSessionRepositoryPort,
  ) {}

  public findById(id: string) {
    const session = this.npcSessionRepository.findById(id);
    if (!session) return null;
    return session.toPublicSnapshot();
  }

  public getByLocationId(locationId: string) {
    const sessions = this.npcSessionRepository.getByLocationId(locationId);
    return sessions.map(session => session.toPublicSnapshot());
  }

  public *getIterable(): Iterable<NpcSessionSnapshot> {
    const sessions = this.npcSessionRepository.getIterable();
    for (const session of sessions) {
      yield session.toPublicSnapshot();
    }
  }
}
