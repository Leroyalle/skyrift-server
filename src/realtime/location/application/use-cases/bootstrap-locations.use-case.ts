import { Inject, Injectable } from '@nestjs/common';

import type { LocationRepositoryPort } from '../../domain/ports/location-repository.port';
import type { ILocation } from '../../domain/types/location.type';
import { LocationAssembler } from '../assemblers/location.assembler';
import type { BootstrapLocationsUseCasePort } from '../ports/bootstrap-locations-use-case.port';
import { LOCATION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class BootstrapLocationsUseCase implements BootstrapLocationsUseCasePort {
  constructor(
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  public execute(locations: Omit<ILocation, 'teleportsMap'>[]) {
    const locationsWithTeleportsMap: ILocation[] = locations.map(LocationAssembler.toDomain);
    this.locationRepository.setAll(locationsWithTeleportsMap);
  }
}
