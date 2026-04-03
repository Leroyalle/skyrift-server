import { Inject, Injectable } from '@nestjs/common';

import type { AoeZoneRepositoryPort } from '../../domain/ports/aoe-zone-repository.port';
import { AOE_ZONE_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class DespawnAoEZoneUseCase {
  constructor(
    @Inject(AOE_ZONE_REPOSITORY_TOKEN)
    private readonly aoeZoneRepository: AoeZoneRepositoryPort,
  ) {}

  public execute(id: string): void {
    this.aoeZoneRepository.remove(id);
  }
}
