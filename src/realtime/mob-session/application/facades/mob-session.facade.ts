import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { MobSessionRepositoryPort } from '../../domain/ports/in-memory-mob-session-repository.port';
import type { MobSessionFacadePort } from '../ports/mob-session-facade.port';
import { MOB_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class MobSessionFacade implements MobSessionFacadePort {
  constructor(
    @Inject(MOB_SESSION_REPOSITORY_TOKEN)
    private readonly mobSessionRepository: MobSessionRepositoryPort,
  ) {}

  public findById(id: string) {
    return this.mobSessionRepository.findByMobId(id);
  }

  public move(mobId: string, position: IPositionTile, now: number): void {
    const mobSession = this.mobSessionRepository.findByMobId(mobId);
    if (!mobSession) return;
    mobSession.moveTo(position.x, position.y, now);
    this.mobSessionRepository.save(mobSession);
  }
}
