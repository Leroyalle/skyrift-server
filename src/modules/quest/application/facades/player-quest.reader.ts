import { Inject, Injectable } from '@nestjs/common';

import type { PlayerQuestRepositoryPort } from '../../domain/ports/player-quest-repository.port';
import type { IPlayerQuest } from '../../domain/types/player-quest.type';
import type { PlayerQuestReaderPort } from '../ports/player-quest-reader.port';
import { PLAYER_QUEST_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class PlayerQuestReader implements PlayerQuestReaderPort {
  constructor(
    @Inject(PLAYER_QUEST_REPOSITORY_TOKEN)
    private readonly playerQuestRepository: PlayerQuestRepositoryPort,
  ) {}

  public async findByCharacterId(characterId: string): Promise<IPlayerQuest[]> {
    const playerQuests = await this.playerQuestRepository.findByCharacterId(characterId);
    return playerQuests.map(playerQuest => playerQuest.snapshot());
  }
  public async findById(id: string): Promise<IPlayerQuest | null> {
    const playerQuest = await this.playerQuestRepository.findById(id);
    if (!playerQuest) return null;
    return playerQuest.snapshot();
  }
}
