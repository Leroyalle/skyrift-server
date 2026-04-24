import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NpcReader } from './application/facades/npc.reader';
import { NPC_PERSISTENCE_REPOSITORY_TOKEN, NPC_READER_TOKEN } from './application/ports/tokens';
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
  ],
  exports: [NPC_READER_TOKEN],
})
export class NpcModule {}
