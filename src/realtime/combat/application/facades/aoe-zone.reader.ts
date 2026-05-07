import { Inject } from '@nestjs/common';

import type { AoeZoneRepositoryPort } from '../../domain/ports/aoe-zone-repository.port';
import type { AoeZoneReaderPort } from '../ports/aoe-zone-reader.port';
import { AOE_ZONE_REPOSITORY_TOKEN } from '../ports/tokens';

export class AoeZoneReader implements AoeZoneReaderPort {
  constructor(
    @Inject(AOE_ZONE_REPOSITORY_TOKEN) private readonly aoeZoneRepository: AoeZoneRepositoryPort,
  ) {}

  public getByLocationId(locationId: string) {
    return this.aoeZoneRepository.getByLocationId(locationId);
  }
}
