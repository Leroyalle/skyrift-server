import { LOCATION_READER_FACADE_TOKEN, type LocationReaderFacadePort } from 'src/modules/location';
import {
  BOOTSTRAP_LOCATIONS_USE_CASE_TOKEN,
  type BootstrapLocationsUseCasePort,
} from 'src/realtime/location';

import { Inject, Injectable } from '@nestjs/common';

import { BootstrapLocationsMapper } from '../../mappers/bootstrap-locations.mapper';

@Injectable()
export class BootstrapLocationsUseCase {
  constructor(
    @Inject(LOCATION_READER_FACADE_TOKEN) private readonly locationReader: LocationReaderFacadePort,
    @Inject(BOOTSTRAP_LOCATIONS_USE_CASE_TOKEN)
    private readonly bootstrapLocationsUseCase: BootstrapLocationsUseCasePort,
  ) {}

  public async execute() {
    const locations = await this.locationReader.getAll();

    const locationsPayload = locations.map(BootstrapLocationsMapper.toPayload);

    this.bootstrapLocationsUseCase.execute(locationsPayload);
  }
}
