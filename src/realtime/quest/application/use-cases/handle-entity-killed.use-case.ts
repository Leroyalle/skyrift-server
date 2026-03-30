import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryPlayerQuestRepositoryPort } from '../../domain/ports/in-memory-player-quest-repository.port';
import type { InMemoryQuestRepositoryPort } from '../../domain/ports/in-memory-quest-repository.port';
import { PLAYER_QUEST_REPOSITORY_TOKEN, QUEST_REPOSITORY_TOKEN } from '../../domain/ports/tokens';
import { QuestProgressor } from '../../domain/services/quest-progressor.service';

@Injectable()
export class HandleEntityKilledUseCase {
  constructor(
    @Inject(PLAYER_QUEST_REPOSITORY_TOKEN)
    private readonly playerQuestInMemoryRepository: InMemoryPlayerQuestRepositoryPort,
    @Inject(QUEST_REPOSITORY_TOKEN)
    private readonly questInMemoryRepository: InMemoryQuestRepositoryPort,
  ) {}

  public execute(input: { attackerRef: IEntityRef; victimRef: IEntityRef }) {
    const activeQuests = this.playerQuestInMemoryRepository.findActiveByCharacterId(
      input.attackerRef.id,
    );

    activeQuests.forEach(playerQuest => {
      const quest = this.questInMemoryRepository.getById(playerQuest.questId);
      if (quest) {
        const { type } = QuestProgressor.progressKillStep(playerQuest, quest, input.victimRef);
        if (type !== 'no-change') {
          this.playerQuestInMemoryRepository.save(playerQuest, input.attackerRef.id);
        }
        return {
          type,
        };
      }
    });
  }
}
