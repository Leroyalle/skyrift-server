import { AOE_ZONE_READER_TOKEN, type AoeZoneReaderPort } from 'src/realtime/combat';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';

import { Inject, Injectable } from '@nestjs/common';

import { SessionClientMapper } from '../../mappers/session-client.mapper';
import type { SocketUserData } from '../../ports/socket-adapter.port';
import type { PlayerConnectionUseCase } from '../connection/player-connection.use-case';

@Injectable()
export class BuildInitialWorldStateUseCase {
  constructor(
    private readonly playerConnectionUseCase: PlayerConnectionUseCase,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(AOE_ZONE_READER_TOKEN) private readonly aoeZoneReader: AoeZoneReaderPort,
  ) {}

  public async execute(payload: SocketUserData) {
    const playerResult = await this.playerConnectionUseCase.execute(payload);

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

    const aoeZones = this.aoeZoneReader.getByLocationId(playerResult.player.locationId);

    // STOPPED: найти мобов, нпс, зоны и чего не хватает

    return {
      ...playerResult,
      players: playerSessionsByLocation,
      mobs: mobSessionsByLocation,
      aoeZones,
    };
  }
}
