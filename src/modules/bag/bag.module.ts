import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BagReader } from './application/facades/bag.reader';
import { BAG_FACADE_TOKEN, BAG_REPOSITORY_TOKEN } from './application/ports/tokens';
import { BagOrmEntity } from './infrastructure/persistence/entities/bag-orm.entity';
import { BagPersistenceRepository } from './infrastructure/persistence/repositories/bag-persistence.repository';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([BagOrmEntity])],
  providers: [
    {
      provide: BAG_REPOSITORY_TOKEN,
      useClass: BagPersistenceRepository,
    },
    {
      provide: BAG_FACADE_TOKEN,
      useClass: BagReader,
    },
  ],
  exports: [BAG_FACADE_TOKEN],
})
export class BagModule {}
