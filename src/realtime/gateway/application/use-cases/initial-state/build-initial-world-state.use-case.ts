import { AOE_ZONE_READER_TOKEN, type AoeZoneReaderPort } from 'src/realtime/combat';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';

import { Inject, Injectable } from '@nestjs/common';

import { SessionClientMapper } from '../../mappers/session-client.mapper';
import type { SocketUserData } from '../../ports/socket-adapter.port';
import type { InitializePlayerSessionUseCase } from '../session/initialize-player-session.use-case';

@Injectable()
export class BuildInitialWorldStateUseCase {
  constructor(
    private readonly initializePlayerSessionUseCase: InitializePlayerSessionUseCase,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(AOE_ZONE_READER_TOKEN) private readonly aoeZoneReader: AoeZoneReaderPort,
  ) {}

  public async execute(payload: SocketUserData) {
    const playerResult = await this.initializePlayerSessionUseCase.execute(payload);

    if (!playerResult) return;

    const playerSnapshotsByLocation = this.entityResolver.getByLocationId(
      playerResult.player.locationId,
      'player',
    );

    const playerSessionsByLocation = playerSnapshotsByLocation.map(
      SessionClientMapper.mapPlayerSession,
    );

    const mobSnapshotsByLocation = this.entityResolver.getByLocationId(
      playerResult.player.locationId,
      'mob',
    );

    const mobSessionsByLocation = mobSnapshotsByLocation.map(SessionClientMapper.mapMobSession);

    const npcSnapshotsByLocation = this.entityResolver.getByLocationId(
      playerResult.player.locationId,
      'npc',
    );

    const npcSessionsByLocation = npcSnapshotsByLocation.map(SessionClientMapper.mapNpcSession);

    const aoeZones = this.aoeZoneReader.getByLocationId(playerResult.player.locationId);

    return {
      ...playerResult,
      players: playerSessionsByLocation,
      mobs: mobSessionsByLocation,
      aoeZones,
      npcs: npcSessionsByLocation,
    };
  }
}
