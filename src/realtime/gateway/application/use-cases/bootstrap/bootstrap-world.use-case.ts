import { Injectable } from '@nestjs/common';

import type { BootstrapLocationsUseCase } from './bootstrap-locations.use-case';
import type { BootstrapMobsUseCase } from './bootstrap-mobs.use-case';
import type { BootstrapNpcsUseCase } from './bootstrap-npcs.use-case';
import type { BootstrapQuestsUseCase } from './bootstrap-quests.use-case';

@Injectable()
export class BootstrapWorldUseCase {
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
