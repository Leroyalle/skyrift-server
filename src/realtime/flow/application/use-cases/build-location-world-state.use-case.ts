import { AOE_ZONE_READER_TOKEN, type AoeZoneReaderPort } from 'src/realtime/combat';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import { SessionClientMapper } from 'src/realtime/shared/mappers/session-client.mapper';

import { Inject, Injectable } from '@nestjs/common';

import type { BuildLocationWorldStatePort } from '../ports/build-location-world-state-use-case.port';

@Injectable()
export class BuildLocationWorldStateUseCase implements BuildLocationWorldStatePort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(AOE_ZONE_READER_TOKEN) private readonly aoeZoneReader: AoeZoneReaderPort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
  ) {}

  public execute(locationId: string) {
    const location = this.locationReader.getById(locationId);

    if (!location) throw new Error('Location not found');

    const playerSnapshotsByLocation = this.entityResolver.getByLocationId(locationId, 'player');

    const playerSessionsByLocation = playerSnapshotsByLocation.map(
      SessionClientMapper.mapPlayerSession,
    );

    const mobSnapshotsByLocation = this.entityResolver.getByLocationId(locationId, 'mob');

    const mobSessionsByLocation = mobSnapshotsByLocation.map(SessionClientMapper.mapMobSession);

    const npcSnapshotsByLocation = this.entityResolver.getByLocationId(locationId, 'npc');

    const npcSessionsByLocation = npcSnapshotsByLocation.map(SessionClientMapper.mapNpcSession);

    const aoeZones = this.aoeZoneReader.getByLocationId(locationId);

    return {
      players: playerSessionsByLocation,
      mobs: mobSessionsByLocation,
      aoeZones,
      npcs: npcSessionsByLocation,
      location,
    };
  }
}
