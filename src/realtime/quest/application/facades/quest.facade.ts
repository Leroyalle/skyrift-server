import { type IQuest, Quest } from 'src/modules/quest';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryQuestRepositoryPort } from '../../domain/ports/in-memory-quest-repository.port';
import type { QuestFacadePort } from '../ports/quest-facade.port';
import { QUEST_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class QuestFacade implements QuestFacadePort {
  constructor(
    @Inject(QUEST_REPOSITORY_TOKEN) private readonly questRepository: InMemoryQuestRepositoryPort,
  ) {}

  public save(payload: IQuest) {
    const quest = Quest.create(payload);
    this.questRepository.save(quest);
  }
}
