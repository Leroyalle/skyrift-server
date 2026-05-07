import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FactionFacade } from './application/facades/faction.facade';
import { FactionReader } from './application/facades/faction.reader';
import {
  FACTION_FACADE_TOKEN,
  FACTION_READER_TOKEN,
  FACTION_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { FactionOrmEntity } from './infrastructure/persistence/entities/faction-orm.entity';
import { FactionPersistenceRepository } from './infrastructure/persistence/repositories/faction-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FactionOrmEntity])],
  providers: [
    {
      provide: FACTION_REPOSITORY_TOKEN,
      useClass: FactionPersistenceRepository,
    },
    {
      provide: FACTION_FACADE_TOKEN,
      useClass: FactionFacade,
    },
    {
      provide: FACTION_READER_TOKEN,
      useClass: FactionReader,
    },
  ],
  exports: [FACTION_FACADE_TOKEN, FACTION_READER_TOKEN],
})
export class FactionModule {}
