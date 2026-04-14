import { Appearance } from 'src/common/domain/vo/appearance.vo';

import { Inject, Injectable } from '@nestjs/common';

import { MobSession } from '../../domain/entities/mob-session.entity';
import type { MobSessionRepositoryPort } from '../../domain/ports/in-memory-mob-session-repository.port';
import type { MobSessionProps } from '../../domain/types/mob-session.type';
import { MOB_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class SpawnMobSessionUseCase {
  constructor(
    @Inject(MOB_SESSION_REPOSITORY_TOKEN)
    private readonly mobSessionRepository: MobSessionRepositoryPort,
  ) {}

  public execute(mob: MobSessionProps) {
    const mobSession = MobSession.create({
      faction: mob.faction,
      id: mob.id,
      name: mob.name,
      level: mob.level,
      position: mob.position,
      combat: mob.combat,
      equipmentId: mob.equipmentId,
      baseStats: mob.baseStats,
      appearance: Appearance.create(mob.appearance),
    });

    this.mobSessionRepository.save(mobSession);

    return mobSession.toPublicSnapshot();
  }
}
