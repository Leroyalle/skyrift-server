import type { AoeZone } from '../types/aoe-zone.type';

export interface AoeZoneRepositoryPort {
  set(aoeZone: AoeZone): void;
  get(id: AoeZone['id']): AoeZone | undefined;
  remove(id: AoeZone['id']): void;
  getIterable(): AoeZone[];
}
