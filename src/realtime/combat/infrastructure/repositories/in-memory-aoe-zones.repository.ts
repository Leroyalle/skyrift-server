import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import { Injectable } from '@nestjs/common';

import type { AoeZoneRepositoryPort } from '../../domain/ports/aoe-zone-repository.port';
import type { AoeZone } from '../../domain/types/aoe-zone.type';

@Injectable()
export class InMemoryAoeZonesRepository implements AoeZoneRepositoryPort {
  private readonly activeAoEZones: Map<string, AoeZone> = new Map();
  private readonly locationIdToAoeZoneIds = new Map<string, Set<string>>();

  public set(aoeZone: AoeZone): void {
    this.activeAoEZones.set(aoeZone.id, aoeZone);
    const set = getOrCreate(this.locationIdToAoeZoneIds, aoeZone.locationId, () => new Set());
    set.add(aoeZone.id);
  }

  public get(id: AoeZone['id']): AoeZone | undefined {
    return this.activeAoEZones.get(id);
  }

  public remove(id: AoeZone['id']): void {
    const aoeZone = this.get(id);

    if (aoeZone) {
      this.locationIdToAoeZoneIds.get(aoeZone.locationId)?.delete(aoeZone.id);
      this.activeAoEZones.delete(id);
    }
  }

  public getIterable(): AoeZone[] {
    return Array.from(this.activeAoEZones.values());
  }

  public getByLocationId(locationId: AoeZone['locationId']): AoeZone[] {
    const set = this.locationIdToAoeZoneIds.get(locationId);

    if (!set) return [];

    return Array.from(set.values())
      .map(id => this.get(id))
      .filter((zone): zone is AoeZone => !!zone);
  }
}
