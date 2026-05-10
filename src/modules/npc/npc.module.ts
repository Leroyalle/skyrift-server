import { CLOCK_TOKEN, SystemClockService } from 'src/realtime/shared/infrastructure/time';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NpcFacade } from './application/facades/npc.facade';
import { NpcReader } from './application/facades/npc.reader';
import {
  NPC_FACADE_TOKEN,
  NPC_PERSISTENCE_REPOSITORY_TOKEN,
  NPC_READER_TOKEN,
} from './application/ports/tokens';
import { NpcOrmEntity } from './infrastructure/persistence/entities/npc-orm.entity';
import { NpcPersistenceRepository } from './infrastructure/persistence/repositories/npc-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NpcOrmEntity])],
  providers: [
    {
      provide: NPC_PERSISTENCE_REPOSITORY_TOKEN,
      useClass: NpcPersistenceRepository,
    },
    {
      provide: NPC_READER_TOKEN,
      useClass: NpcReader,
    },
    {
      provide: NPC_FACADE_TOKEN,
      useClass: NpcFacade,
    },
    { provide: CLOCK_TOKEN, useClass: SystemClockService },
  ],
  exports: [NPC_READER_TOKEN, NPC_FACADE_TOKEN],
})
export class NpcModule {}
