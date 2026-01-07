import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { Quest } from 'src/quest/entities/quest.entity';

import { Injectable } from '@nestjs/common';

import { IRuntimeQuest } from './types/runtime-quest.type';

@Injectable()
export class RuntimeQuestService {
  constructor() {}

  public getAvailableQuests(playerState: IRuntimeCharacter, quests: Quest[]) {
    const availableQuests = quests.filter(quest => {
      quest.prerequisites.every(prerequisite => {
        if (prerequisite.type === 'level') {
          return playerState.level >= prerequisite.minLevel;
        } else if (prerequisite.type === 'quest_completed') {
          return playerState.completedQuestIds.has(quest.id);
        }
      });
    });

    return availableQuests;
  }

  public acceptQuest(playerState: IRuntimeCharacter, quest: IRuntimeQuest) {
    playerState.activeQuests.push(quest);
  }
}
