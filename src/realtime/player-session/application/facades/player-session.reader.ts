import { Inject, Injectable } from '@nestjs/common';

import type { PlayerSessionRepositoryPort } from '../../domain/ports/in-memory-player-session-repository.port';
import type { PlayerSessionReaderPort } from '../ports/player-session-reader.port';
import { PLAYER_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class PlayerSessionReader implements PlayerSessionReaderPort {
  constructor(
    @Inject(PLAYER_SESSION_REPOSITORY_TOKEN)
    private readonly playerSessionRepository: PlayerSessionRepositoryPort,
  ) {}

  public getByLocationId(locationId: string) {
    const playerSessions = this.playerSessionRepository.getByLocationId(locationId);
    return playerSessions.map(session => session.toPublicSnapshot());
  }
}
