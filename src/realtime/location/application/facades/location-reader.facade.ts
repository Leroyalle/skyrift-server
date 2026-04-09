import { Inject, Injectable } from '@nestjs/common';

import type { LocationRepositoryPort } from '../../domain/ports/location-repository.port';
import type { ILocation } from '../../domain/types/location.type';
import type { LocationReaderPort } from '../ports/location-reader.port';
import { LOCATION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class LocationReaderQuery implements LocationReaderPort {
  constructor(
    @Inject(LOCATION_REPOSITORY_TOKEN) private readonly locationRepository: LocationRepositoryPort,
  ) {}

  public getById(id: ILocation['id']): ILocation | null {
    return this.locationRepository.get(id);
  }
}
