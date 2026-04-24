import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpawnReaderFacade } from './application/facades/spawn-reader.facade';
import {
  ENTITY_SPAWN_REPOSITORY_TOKEN,
  SPAWN_READER_FACADE_TOKEN,
} from './application/ports/tokens';
import { EntitySpawnOrmEntity } from './infrastructure/persistence/entities/entity-spawn-orm.entity';
import { EntitySpawnPersistenceRepository } from './infrastructure/persistence/repositories/entity-spawn-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EntitySpawnOrmEntity])],
  providers: [
    {
      provide: ENTITY_SPAWN_REPOSITORY_TOKEN,
      useClass: EntitySpawnPersistenceRepository,
    },
    {
      provide: SPAWN_READER_FACADE_TOKEN,
      useClass: SpawnReaderFacade,
    },
  ],
  exports: [SPAWN_READER_FACADE_TOKEN],
})
export class SpawnModule {}
