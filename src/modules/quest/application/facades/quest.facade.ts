import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { Quest } from '../../domain/entities/quest.entity';
import { QuestRepositoryPort } from '../../domain/ports/quest-repository.port';
import { IQuest } from '../../domain/types/quest.type';
import { QuestFacadePort } from '../ports/quest-facade.port';
import { QUEST_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class QuestFacade implements QuestFacadePort {
  constructor(@Inject(QUEST_REPOSITORY_TOKEN) private readonly repository: QuestRepositoryPort) {}

  public async create(payload: Omit<IQuest, 'id'>) {
    const quest = Quest.create({ id: randomUUID(), ...payload });
    const result = await this.repository.save(quest);
    return result.snapshot();
  }

  public remove(id: string) {
    return this.repository.remove(id);
  }
}
