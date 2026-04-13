import type { PlayerSessionSnapshot } from 'src/realtime/player-session';

import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { PlayerSession } from '../../../domain/entities/player-session.entity';
import type { PlayerSessionRepositoryPort } from '../../../domain/ports/in-memory-player-session-repository.port';
import { PlayerSessionMapper } from '../../mappers/player-session.mapper';
import { PLAYER_SESSION_REPOSITORY_TOKEN } from '../../ports/tokens';

import { ConnectPlayerCommand } from './connect-player.command';

@CommandHandler(ConnectPlayerCommand)
export class ConnectPlayerHandler implements ICommandHandler<ConnectPlayerCommand> {
  constructor(
    @Inject(PLAYER_SESSION_REPOSITORY_TOKEN)
    private readonly playerSessionRepository: PlayerSessionRepositoryPort,
  ) {}

  public async execute(command: ConnectPlayerCommand): Promise<PlayerSessionSnapshot> {
    const data = PlayerSessionMapper.toDomainData(command.props);

    const player = PlayerSession.create(data);

    this.playerSessionRepository.save(player);

    return Promise.resolve(player.toPublicSnapshot());
  }
}
