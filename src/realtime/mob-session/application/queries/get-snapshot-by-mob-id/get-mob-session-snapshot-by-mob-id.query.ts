import type { MobSessionRepositoryPort } from 'src/realtime/mob-session/domain/ports/in-memory-mob-session-repository.port';

import { Inject, Injectable } from '@nestjs/common';

import type { GetMobSessionSnapshotByMobIdPort } from '../../ports/get-mob-session-snapshot-by-mob-id.port';
import { MOB_SESSION_REPOSITORY_TOKEN } from '../../ports/tokens';

@Injectable()
export class GetMobSessionSnapshotByMobIdQuery implements GetMobSessionSnapshotByMobIdPort {
  constructor(
    @Inject(MOB_SESSION_REPOSITORY_TOKEN)
    private readonly mobSessionRepository: MobSessionRepositoryPort,
  ) {}

  public execute(mobId: string) {
    const mobSession = this.mobSessionRepository.findByMobId(mobId);

    if (!mobSession) {
      return null;
    }

    return mobSession.toPublicSnapshot();
  }
}
