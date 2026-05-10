import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import type { PlayerSessionSnapshot } from '../../domain/types/player-session.type';
import { ConnectPlayerCommand } from '../commands/connect-player/connect-player.command';
import type { ConnectPlayerUseCasePort } from '../ports/connect-player-use-case.port';
import type { ConnectPlayerPayload } from '../types/connect-player-payload.type';

@Injectable()
export class ConnectPlayerUseCase implements ConnectPlayerUseCasePort {
  constructor(private readonly commandBus: CommandBus) {}

  public async execute(data: ConnectPlayerPayload): Promise<PlayerSessionSnapshot> {
    return await this.commandBus.execute<ConnectPlayerCommand, PlayerSessionSnapshot>(
      new ConnectPlayerCommand(data),
    );
  }
}
