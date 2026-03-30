import { randomUUID } from 'crypto';
import { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryPlayerQuestRepositoryPort } from '../../domain/ports/in-memory-player-quest-repository.port';
import type { InMemoryQuestRepositoryPort } from '../../domain/ports/in-memory-quest-repository.port';
import { PLAYER_QUEST_REPOSITORY_TOKEN, QUEST_REPOSITORY_TOKEN } from '../../domain/ports/tokens';

@Injectable()
export class AcceptQuestUseCase {
  constructor(
    @Inject(PLAYER_QUEST_REPOSITORY_TOKEN)
    private readonly playerQuestRepository: InMemoryPlayerQuestRepositoryPort,
    @Inject(QUEST_REPOSITORY_TOKEN)
    private readonly questRepository: InMemoryQuestRepositoryPort,
  ) {}

  public execute(input: {
    characterId: string;
    questId: string;
    playerLevel: number;
    activeQuestIds: string[];
    completedQuestIds: string[];
  }) {
    const quest = this.questRepository.getById(input.questId);

    if (!quest) throw new Error('Quest not found');

    if (!quest.canBeAccepted(input)) throw new Error('Quest can not be accepted');

    const playerQuest = PlayerQuest.create({
      id: randomUUID(),
      characterId: input.characterId,
      questId: input.questId,
      stepIndex: 0,
      progress: null,
      completedAt: null,
    });

    this.playerQuestRepository.save(playerQuest, input.characterId);

    return playerQuest.snapshot();
  }
}
