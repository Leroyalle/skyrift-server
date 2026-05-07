import type { AoeZone } from '../../domain/types/aoe-zone.type';

export interface AoeZoneReaderPort {
  getByLocationId(locationId: string): AoeZone[];
}
