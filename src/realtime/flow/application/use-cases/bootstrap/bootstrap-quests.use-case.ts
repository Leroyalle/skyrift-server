import { QUEST_READER_TOKEN, type QuestReaderPort } from 'src/modules/quest';
import { QUEST_FACADE_TOKEN, type QuestFacadePort } from 'src/realtime/quest';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BootstrapQuestsUseCase {
  constructor(
    @Inject(QUEST_READER_TOKEN) private readonly questReader: QuestReaderPort,
    @Inject(QUEST_FACADE_TOKEN) private readonly questFacade: QuestFacadePort,
  ) {}

  public async execute() {
    const quests = await this.questReader.findAll();

    for (const quest of quests) {
      this.questFacade.save(quest);
    }
  }
}
