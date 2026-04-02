import type { PositionDto } from 'src/common/dto/position.dto';

import { Inject, Injectable } from '@nestjs/common';

import type { PlayerSessionRepositoryPort } from '../../domain/ports/in-memory-player-session-repository.port';
import type { PlayerSessionFacadePort } from '../ports/player-session-facade.port';
import { PLAYER_SESSION_REPOSITORY } from '../ports/tokens';

@Injectable()
export class PlayerSessionFacade implements PlayerSessionFacadePort {
  constructor(
    @Inject(PLAYER_SESSION_REPOSITORY)
    private readonly playerSessionRepository: PlayerSessionRepositoryPort,
  ) {}

  public move(characterId: string, position: PositionDto, now: number): void {
    const session = this.playerSessionRepository.findByCharacterId(characterId);
    if (!session) return;
    session.moveTo(position.x, position.y, now);
    this.playerSessionRepository.save(session);
  }

  // public startAttackByCharacterId(characterId: string, targetId: string, now: number): void {
  //   const session = this.playerSessionRepository.findByCharacterId(characterId);
  //   if (!session) return;
  //   session.startAttackByCharacterId(targetId, now);
  //   this.playerSessionRepository.save(session);
  // }
}
