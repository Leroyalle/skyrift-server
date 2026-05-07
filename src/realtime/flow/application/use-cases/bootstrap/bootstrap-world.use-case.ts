import { Injectable } from '@nestjs/common';

import { BootstrapWorldPort } from '../../ports/bootstrap/bootstrap-world.port';

import { BootstrapLocationsUseCase } from './bootstrap-locations.use-case';
import { BootstrapMobsUseCase } from './bootstrap-mobs.use-case';
import { BootstrapNpcsUseCase } from './bootstrap-npcs.use-case';
import { BootstrapQuestsUseCase } from './bootstrap-quests.use-case';

@Injectable()
export class BootstrapWorldUseCase implements BootstrapWorldPort {
  constructor(
    private readonly bootstrapLocationsUseCase: BootstrapLocationsUseCase,
    private readonly bootstrapMobsUseCase: BootstrapMobsUseCase,
    private readonly bootstrapNpcsUseCase: BootstrapNpcsUseCase,
    private readonly bootstrapQuestsUseCase: BootstrapQuestsUseCase,
  ) {}

  public async execute() {
    await this.bootstrapLocationsUseCase.execute();
    await this.bootstrapMobsUseCase.execute();
    await this.bootstrapNpcsUseCase.execute();
    await this.bootstrapQuestsUseCase.execute();
  }
}
