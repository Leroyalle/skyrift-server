import { Inject, Injectable } from '@nestjs/common';

import { MobSession } from '../../domain/entities/mob-session.entity';
import type { MobSessionRepositoryPort } from '../../domain/ports/in-memory-mob-session-repository.port';
import type { IMobSession } from '../../domain/types/mob-session.type';
import { MOB_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class SpawnMobSessionUseCase {
  constructor(
    @Inject(MOB_SESSION_REPOSITORY_TOKEN)
    private readonly mobSessionRepository: MobSessionRepositoryPort,
  ) {}

  public execute(mob: Omit<IMobSession, 'id'>) {
    const mobSession = MobSession.create({
      mobId: mob.mobId,
      name: mob.name,
      level: mob.level,
      position: mob.position,
      dirty: mob.dirty,
      combat: mob.combat,
      equipmentId: mob.equipmentId,
      baseStats: mob.baseStats,
      appearance: mob.appearance,
    });

    this.mobSessionRepository.save(mobSession);

    return mobSession.toPublicSnapshot();
  }
}
