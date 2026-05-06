import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BagFacade } from './application/facades/bag.facade';
import { BAG_FACADE_TOKEN, BAG_REPOSITORY_TOKEN } from './application/ports/tokens';
import { queries } from './application/queries/queries';
import { BagOrmEntity } from './infrastructure/persistence/entities/bag-orm.entity';
import { BagPersistenceRepository } from './infrastructure/persistence/repositories/bag-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BagOrmEntity])],
  providers: [
    {
      provide: BAG_REPOSITORY_TOKEN,
      useClass: BagPersistenceRepository,
    },
    {
      provide: BAG_FACADE_TOKEN,
      useClass: BagFacade,
    },
    ...queries,
  ],
  exports: [BAG_FACADE_TOKEN],
})
export class BagModule {}
