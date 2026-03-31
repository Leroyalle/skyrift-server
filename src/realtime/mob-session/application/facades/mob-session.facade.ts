import { Inject, Injectable } from '@nestjs/common';

import type { MobSessionRepositoryPort } from '../../domain/ports/in-memory-mob-session-repository.port';
import { MOB_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class MobSessionFacade {
  constructor(
    @Inject(MOB_SESSION_REPOSITORY_TOKEN)
    private readonly mobSessionRepository: MobSessionRepositoryPort,
  ) {}

  public findById(id: string) {
    return this.mobSessionRepository.findByMobId(id);
  }
}
