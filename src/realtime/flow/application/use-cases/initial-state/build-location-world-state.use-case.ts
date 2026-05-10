import { AOE_ZONE_READER_TOKEN, type AoeZoneReaderPort } from 'src/realtime/combat';
import {
  EQUIPMENT_CONTAINER_FACADE_TOKEN,
  EquipmentContainerFacadePort,
} from 'src/realtime/container';
import { EntityWithEquipment } from 'src/realtime/contracts/types/entity-with-equipment.type';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import { MobSessionSnapshot } from 'src/realtime/mob-session';
import { NpcSessionSnapshot } from 'src/realtime/npc-session';
import { ClientPlayerSession } from 'src/realtime/player-session';
import { SessionClientMapper } from 'src/realtime/shared/mappers/session-client.mapper';

import { Inject, Injectable } from '@nestjs/common';

import type { BuildLocationWorldStatePort } from '../../ports/build-location-world-state-use-case.port';

@Injectable()
export class BuildLocationWorldStateUseCase implements BuildLocationWorldStatePort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(AOE_ZONE_READER_TOKEN) private readonly aoeZoneReader: AoeZoneReaderPort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
    @Inject(EQUIPMENT_CONTAINER_FACADE_TOKEN)
    private readonly equipmentContainerFacade: EquipmentContainerFacadePort,
  ) {}

  public async execute(locationId: string) {
    const location = this.locationReader.getById(locationId);

    if (!location) throw new Error('Location not found');

    const playerSessionsByLocation = await this.getPlayers(locationId);

    const mobSessionsByLocation = await this.getMobs(locationId);

    const npcSessionsByLocation = await this.getnpcs(locationId);

    const aoeZones = this.aoeZoneReader.getByLocationId(locationId);

    return {
      players: playerSessionsByLocation,
      mobs: mobSessionsByLocation,
      aoeZones,
      npcs: npcSessionsByLocation,
      location,
    };
  }

  private async getnpcs(locationId: string) {
    const snapshots = this.entityResolver.getByLocationId(locationId, 'npc');
    const sessions: EntityWithEquipment<NpcSessionSnapshot>[] = [];
    for (const snapshot of snapshots) {
      const equipment = await this.equipmentContainerFacade.getContainerById(snapshot.equipmentId);
      if (!equipment) throw new Error('Equipment not found');
      sessions.push(SessionClientMapper.mapNpcSession(snapshot, equipment));
    }
    return sessions;
  }

  private async getMobs(locationId: string) {
    const snapshots = this.entityResolver.getByLocationId(locationId, 'mob');
    const sessions: EntityWithEquipment<MobSessionSnapshot>[] = [];
    for (const snapshot of snapshots) {
      const equipment = await this.equipmentContainerFacade.getContainerById(snapshot.equipmentId);
      if (!equipment) throw new Error('Equipment not found');
      sessions.push(SessionClientMapper.mapMobSession(snapshot, equipment));
    }
    return sessions;
  }

  private async getPlayers(locationId: string) {
    const snapshots = this.entityResolver.getByLocationId(locationId, 'player');
    const sessions: EntityWithEquipment<ClientPlayerSession>[] = [];
    for (const snapshot of snapshots) {
      const equipment = await this.equipmentContainerFacade.getContainerById(snapshot.equipmentId);
      if (!equipment) throw new Error('Equipment not found');
      sessions.push(SessionClientMapper.mapPlayerSession(snapshot, equipment));
    }
    return sessions;
  }
}
