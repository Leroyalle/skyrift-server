import { Inject, Injectable } from '@nestjs/common';

import type { QuestRepositoryPort } from '../../domain/ports/quest-repository.port';
import type { QuestReaderPort } from '../ports/quest-reader.port';
import { QUEST_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class QuestReader implements QuestReaderPort {
  constructor(
    @Inject(QUEST_REPOSITORY_TOKEN) private readonly questRepository: QuestRepositoryPort,
  ) {}

  public async findAll() {
    const quests = await this.questRepository.findAll();
    return quests.map(quest => quest.snapshot());
  }

  public async findByGiverId(giverId: string) {
    const quests = await this.questRepository.findByGiverId(giverId);
    return quests.map(quest => quest.snapshot());
  }

  public async findById(id: string) {
    const quest = await this.questRepository.findById(id);
    if (!quest) return null;
    return quest.snapshot();
  }
}
