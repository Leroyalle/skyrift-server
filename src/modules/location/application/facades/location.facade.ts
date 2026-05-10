import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import { LocationPersistenceRepositoryPort } from '../../domain/ports/location-persistence-repository.port';
import { ILocation } from '../../domain/types/location.type';
import { LocationFacadePort } from '../ports/location-facade.port';
import { LOCATION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class LocationFacade implements LocationFacadePort {
  constructor(
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationPersistenceRepositoryPort,
  ) {}

  public create(location: Omit<ILocation, 'id'>) {
    return this.locationRepository.save({ ...location, id: randomUUID() });
  }

  public delete(id: ILocation['id']) {
    return this.locationRepository.delete(id);
  }
}
