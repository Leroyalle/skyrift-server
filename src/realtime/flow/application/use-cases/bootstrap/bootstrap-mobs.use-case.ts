import { MOB_READER_TOKEN, type MobReaderPort } from 'src/modules/mob';
import { SPAWN_READER_FACADE_TOKEN, type SpawnReaderFacadePort } from 'src/modules/spawn';
import { SPAWN_MOB_USE_CASE_TOKEN, type SpawnMobUseCasePort } from 'src/realtime/mob-session';

import { Inject, Injectable } from '@nestjs/common';

import { BootstrapMobsMapper } from '../../mappers/bootstrap-mobs.mapper';

@Injectable()
export class BootstrapMobsUseCase {
  constructor(
    @Inject(MOB_READER_TOKEN) private readonly mobReader: MobReaderPort,
    @Inject(SPAWN_MOB_USE_CASE_TOKEN) private readonly spawnMobUseCase: SpawnMobUseCasePort,
    @Inject(SPAWN_READER_FACADE_TOKEN) private readonly spawnReaderFacade: SpawnReaderFacadePort,
  ) {}

  public async execute() {
    const mobs = await this.mobReader.getAll();

    for (const mob of mobs) {
      const spawn = await this.spawnReaderFacade.get(mob.spawnId);
      if (!spawn) continue;
      this.spawnMobUseCase.execute(BootstrapMobsMapper.toProps(mob, spawn));
    }
  }
}
