import type { GetPlayerSessionSnapshotByCharacterIdPort } from 'src/realtime/player-session/application/ports/get-player-session-snapshot-by-character-id.port.ts';
import type { PlayerSessionRepositoryPort } from 'src/realtime/player-session/domain/ports/in-memory-player-session-repository.port';

import { Inject, Injectable } from '@nestjs/common';

import { PLAYER_SESSION_REPOSITORY_TOKEN } from '../../ports/tokens';

@Injectable()
export class GetPlayerSessionSnapshotByCharacterIdQuery implements GetPlayerSessionSnapshotByCharacterIdPort {
  constructor(
    @Inject(PLAYER_SESSION_REPOSITORY_TOKEN)
    private readonly playerSessionRepository: PlayerSessionRepositoryPort,
  ) {}

  public execute(characterId: string) {
    const playerSession = this.playerSessionRepository.findById(characterId);

    if (!playerSession) {
      return null;
    }

    return playerSession.toPublicSnapshot();
  }
}
