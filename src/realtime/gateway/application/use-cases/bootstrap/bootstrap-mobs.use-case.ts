import { MOB_READER_TOKEN, type MobReaderPort } from 'src/modules/mob';
import { SPAWN_MOB_USE_CASE_TOKEN, type SpawnMobUseCasePort } from 'src/realtime/mob-session';

import { Inject, Injectable } from '@nestjs/common';

import { BootstrapMobsMapper } from '../../mappers/bootstrap-mobs.mapper';

@Injectable()
export class BootstrapMobsUseCase {
  constructor(
    @Inject(MOB_READER_TOKEN) private readonly mobReader: MobReaderPort,
    @Inject(SPAWN_MOB_USE_CASE_TOKEN) private readonly spawnMobUseCase: SpawnMobUseCasePort,
  ) {}

  public async execute() {
    const mobs = await this.mobReader.getAll();

    for (const mob of mobs) {
      this.spawnMobUseCase.execute(BootstrapMobsMapper.toProps(mob));
    }
  }
}
