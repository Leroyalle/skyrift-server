import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryQuestRepositoryPort } from '../../domain/ports/in-memory-quest-repository.port';
import type { QuestReaderPort } from '../ports/quest-reader.port';
import { QUEST_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class QuestReader implements QuestReaderPort {
  constructor(
    @Inject(QUEST_REPOSITORY_TOKEN) private readonly questRepository: InMemoryQuestRepositoryPort,
  ) {}

  public findByGiverId(giverId: string) {
    const quests = this.questRepository.getByGiverId(giverId);
    return quests.map(quest => quest.snapshot());
  }
}
