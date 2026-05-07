import { Inject, Injectable } from '@nestjs/common';

import type { MobSessionRepositoryPort } from '../../domain/ports/in-memory-mob-session-repository.port';
import type { MobSessionSnapshot } from '../../domain/types/mob-session.type';
import type { MobSessionReaderPort } from '../ports/mob-session-reader.port';
import { MOB_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class MobSessionReader implements MobSessionReaderPort {
  constructor(
    @Inject(MOB_SESSION_REPOSITORY_TOKEN)
    private readonly mobSessionRepository: MobSessionRepositoryPort,
  ) {}

  public getByLocationId(locationId: string) {
    const mobSessions = this.mobSessionRepository.getByLocationId(locationId);
    return mobSessions.map(session => session.toPublicSnapshot());
  }

  public *getIterable(): Iterable<MobSessionSnapshot> {
    const sessions = this.mobSessionRepository.getIterable();
    for (const session of sessions) {
      yield session.toPublicSnapshot();
    }
  }
}
