import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationReaderFacade } from './application/facades/location-reader.facade';
import {
  LOCATION_READER_FACADE_TOKEN,
  LOCATION_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { LocationOrmEntity } from './infrastructure/persistence/entities/location-orm.entity';
import { LocationPersistenceRepository } from './infrastructure/persistence/repositories/location-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LocationOrmEntity])],
  providers: [
    {
      provide: LOCATION_REPOSITORY_TOKEN,
      useClass: LocationPersistenceRepository,
    },
    {
      provide: LOCATION_READER_FACADE_TOKEN,
      useClass: LocationReaderFacade,
    },
  ],
  exports: [LOCATION_READER_FACADE_TOKEN],
})
export class LocationModule {}
