import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { MobSessionRepositoryPort } from '../../domain/ports/in-memory-mob-session-repository.port';
import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';
import type { MobSessionFacadePort } from '../ports/mob-session-facade.port';
import { MOB_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class MobSessionFacade implements MobSessionFacadePort {
  constructor(
    @Inject(MOB_SESSION_REPOSITORY_TOKEN)
    private readonly mobSessionRepository: MobSessionRepositoryPort,
  ) {}

  public findById(id: string) {
    return this.mobSessionRepository.findById(id);
  }

  public move(mobId: string, position: IPositionTile, now: number): void {
    const mobSession = this.mobSessionRepository.findById(mobId);
    if (!mobSession) return;
    mobSession.moveTo(position.x, position.y, now);
    this.mobSessionRepository.save(mobSession);
  }

  public applyDamage(
    id: string,
    amount: number,
    attackerRef: IEntityRef,
  ): IReceiveDamageResult | undefined {
    const session = this.mobSessionRepository.findById(id);
    if (!session) return;

    const result = session.receiveDamage(amount);

    if (result.isAlive) {
      session.updateAggro(attackerRef, amount);
    }

    this.mobSessionRepository.save(session);

    return result;
  }
}
