import { Module } from '@nestjs/common';

import { FACTION_REPOSITORY_TOKEN } from './application/ports/tokens';
import { InMemoryFactionRepository } from './infrastructure/repositories/in-memory-faction.repository';

@Module({
  providers: [
    {
      provide: FACTION_REPOSITORY_TOKEN,
      useClass: InMemoryFactionRepository,
    },
  ],
})
export class FactionModule {}
