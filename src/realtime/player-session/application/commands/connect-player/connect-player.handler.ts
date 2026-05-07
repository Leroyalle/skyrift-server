import type { PlayerSessionSnapshot } from 'src/realtime/player-session';
import {
  LOCATION_PRESENCE_ADAPTER_TOKEN,
  LocationPresenceAdapterPort,
} from 'src/realtime/presence';
import { SPATIAL_GRID_INDEX_TOKEN, SpatialGridIndexPort } from 'src/realtime/spatial-grid';

import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { PlayerSession } from '../../../domain/entities/player-session.entity';
import type { PlayerSessionRepositoryPort } from '../../../domain/ports/in-memory-player-session-repository.port';
import { assertHasInventory } from '../../lib/assert-has-inventory.lib';
import { PlayerSessionMapper } from '../../mappers/player-session.mapper';
import { PLAYER_SESSION_REPOSITORY_TOKEN } from '../../ports/tokens';

import { ConnectPlayerCommand } from './connect-player.command';

@CommandHandler(ConnectPlayerCommand)
export class ConnectPlayerHandler implements ICommandHandler<ConnectPlayerCommand> {
  constructor(
    @Inject(PLAYER_SESSION_REPOSITORY_TOKEN)
    private readonly playerSessionRepository: PlayerSessionRepositoryPort,
    @Inject(SPATIAL_GRID_INDEX_TOKEN) private readonly spatialGridIndex: SpatialGridIndexPort,
    @Inject(LOCATION_PRESENCE_ADAPTER_TOKEN)
    private readonly locationPresenceAdapter: LocationPresenceAdapterPort,
  ) {}

  public async execute(command: ConnectPlayerCommand): Promise<PlayerSessionSnapshot> {
    assertHasInventory(command.props);

    const data = PlayerSessionMapper.toDomainData(command.props);

    const player = PlayerSession.create(data);

    this.playerSessionRepository.save(player);

    await this.locationPresenceAdapter.addPlayer(player.id, player.locationId);

    this.spatialGridIndex.add({
      id: player.id,
      locationId: player.locationId,
      x: player.position.x,
      y: player.position.y,
      type: 'player',
    });

    return Promise.resolve(player.toPublicSnapshot());
  }
}
