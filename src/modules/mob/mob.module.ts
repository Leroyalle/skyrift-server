import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MobReader } from './application/facades/mob.reader';
import { MOB_PERSISTENCE_REPOSITORY_TOKEN, MOB_READER_TOKEN } from './application/ports/tokens';
import { MobOrmEntity } from './infrastructure/persistence/entities/mob-orm.entity';
import { MobPersistenceRepository } from './infrastructure/persistence/repositories/mob-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MobOrmEntity])],
  providers: [
    {
      provide: MOB_READER_TOKEN,
      useClass: MobReader,
    },
    {
      provide: MOB_PERSISTENCE_REPOSITORY_TOKEN,
      useClass: MobPersistenceRepository,
    },
  ],
  exports: [MOB_READER_TOKEN],
})
export class MobModule {}
