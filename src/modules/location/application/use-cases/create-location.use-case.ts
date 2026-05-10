import { Inject, Injectable } from '@nestjs/common';

import type { LocationPersistenceRepositoryPort } from '../../domain/ports/location-persistence-repository.port';
import type { ILocation } from '../../domain/types/location.type';
import { CreateLocationUseCasePort } from '../ports/create-location-use-case.port';
import { LOCATION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class CreateLocationUseCase implements CreateLocationUseCasePort {
  constructor(
    @Inject(LOCATION_REPOSITORY_TOKEN)
    private readonly locationRepository: LocationPersistenceRepositoryPort,
  ) {}

  public execute(payload: ILocation) {
    return this.locationRepository.save(payload);
  }
}
