import { Module } from '@nestjs/common';

import { LocationReaderFacade } from './application/facades/location-reader.facade';
import {
  BOOTSTRAP_LOCATIONS_USE_CASE_TOKEN,
  LOCATION_READER_TOKEN,
  LOCATION_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { BootstrapLocationsUseCase } from './application/use-cases/bootstrap-locations.use-case';
import { InMemoryLocationRepository } from './infrastructure/repositories/in-memory-location.repository';

@Module({
  providers: [
    { provide: LOCATION_REPOSITORY_TOKEN, useClass: InMemoryLocationRepository },
    {
      provide: LOCATION_READER_TOKEN,
      useClass: LocationReaderFacade,
    },
    {
      provide: BOOTSTRAP_LOCATIONS_USE_CASE_TOKEN,
      useClass: BootstrapLocationsUseCase,
    },
  ],
  exports: [LOCATION_READER_TOKEN, BOOTSTRAP_LOCATIONS_USE_CASE_TOKEN],
})
export class LocationModule {}
