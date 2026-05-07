import { type IPlayerQuest, PlayerQuest } from 'src/modules/quest';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryPlayerQuestRepositoryPort } from '../../domain/ports/in-memory-player-quest-repository.port';
import type { PlayerQuestFacadePort } from '../ports/player-quest.facade';
import { PLAYER_QUEST_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class PlayerQuestFacade implements PlayerQuestFacadePort {
  constructor(
    @Inject(PLAYER_QUEST_REPOSITORY_TOKEN)
    private readonly playerQuestRepository: InMemoryPlayerQuestRepositoryPort,
  ) {}

  public save(payload: IPlayerQuest) {
    const playerQuest = PlayerQuest.create(payload);
    this.playerQuestRepository.save(playerQuest);
  }
}
