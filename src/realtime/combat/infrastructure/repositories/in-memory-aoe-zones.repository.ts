import { Injectable } from '@nestjs/common';

import type { AoeZoneRepositoryPort } from '../../domain/ports/aoe-zone-repository.port';
import type { AoeZone } from '../../domain/types/aoe-zone.type';

@Injectable()
export class InMemoryAoeZonesRepository implements AoeZoneRepositoryPort {
  private readonly activeAoEZones: Map<string, AoeZone> = new Map();

  public set(aoeZone: AoeZone): void {
    this.activeAoEZones.set(aoeZone.id, aoeZone);
  }

  public get(id: AoeZone['id']): AoeZone | undefined {
    return this.activeAoEZones.get(id);
  }

  public remove(id: AoeZone['id']): void {
    this.activeAoEZones.delete(id);
  }

  public getIterable(): AoeZone[] {
    return Array.from(this.activeAoEZones.values());
  }
}
