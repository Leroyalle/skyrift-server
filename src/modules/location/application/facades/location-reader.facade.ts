import { Inject, Injectable } from '@nestjs/common';

import type { LocationPersistenceRepositoryPort } from '../../domain/ports/location-persistence-repository.port';
import type { ILocation } from '../../domain/types/location.type';
import type { LocationReaderFacadePort } from '../ports/location-reader-facade.port';
import { LOCATION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class LocationReaderFacade implements LocationReaderFacadePort {
  constructor(
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationPersistenceRepositoryPort,
  ) {}

  public async getAll(): Promise<ILocation[]> {
    return this.locationRepository.getAll();
  }

  public async get(id: ILocation['id']): Promise<ILocation | null> {
    return this.locationRepository.get(id);
  }
}
