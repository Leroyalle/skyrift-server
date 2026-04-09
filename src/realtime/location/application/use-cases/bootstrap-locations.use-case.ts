import { Inject, Injectable } from '@nestjs/common';

import type { LocationRepositoryPort } from '../../domain/ports/location-repository.port';
import type { ILocation } from '../../domain/types/location.type';
import { LOCATION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class BootstrapLocationsUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  public execute(locations: ILocation[]) {
    this.locationRepository.setAll(locations);
  }
}
