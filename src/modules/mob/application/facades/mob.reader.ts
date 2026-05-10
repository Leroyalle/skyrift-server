import { Inject, Injectable } from '@nestjs/common';

import type { MobPersistenceRepositoryPort } from '../../domain/ports/mob-persistence-repository.port';
import type { MobReaderPort } from '../ports/mob-reader.port';
import { MOB_PERSISTENCE_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class MobReader implements MobReaderPort {
  constructor(
    @Inject(MOB_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly mobRepository: MobPersistenceRepositoryPort,
  ) {}

  public async getById(id: string) {
    const mob = await this.mobRepository.findById(id);
    if (!mob) return null;
    return mob.snapshot();
  }

  public async getByLocationId(locationId: string) {
    const mobs = await this.mobRepository.findByLocationId(locationId);
    return mobs.map(mob => mob.snapshot());
  }

  public async getAll() {
    const mobs = await this.mobRepository.findAll();
    return mobs.map(mob => mob.snapshot());
  }
}
