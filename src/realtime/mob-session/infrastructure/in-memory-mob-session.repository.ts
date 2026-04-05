import { Injectable } from '@nestjs/common';

import type { MobSession } from '../domain/entities/mob-session.entity';
import type { MobSessionRepositoryPort } from '../domain/ports/in-memory-mob-session-repository.port';

@Injectable()
export class InMemoryMobSessionRepository implements MobSessionRepositoryPort {
  private readonly mobs: Map<string, MobSession> = new Map();

  public findById(id: string): MobSession | null {
    return this.mobs.get(id) ?? null;
  }

  public save(mobSession: MobSession): void {
    this.mobs.set(mobSession.mobId, mobSession);
  }

  public remove(id: string): void {
    this.mobs.delete(id);
  }
}
