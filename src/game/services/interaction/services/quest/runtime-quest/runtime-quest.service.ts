import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { Quest } from 'src/quest/entities/quest.entity';

import { Injectable } from '@nestjs/common';

import { QuestIndexService } from '../quest-index/quest-index.service';

import { IRuntimeQuest } from './types/runtime-quest.type';

@Injectable()
export class RuntimeQuestService {
  constructor(private readonly questIndexService: QuestIndexService) {}

  public getAvailableQuests(playerState: IRuntimeCharacter, quests: Quest[]): Quest[] {
    console.log('QUESTS', quests);
    const availableQuests = quests.filter(quest => {
      if (playerState.completedQuestIds.has(quest.id)) return false;

      if (playerState.activeQuests.some(activeQuest => activeQuest.quest.id === quest.id))
        return false;

      if (!quest.prerequisites) return true;

      quest.prerequisites.every(prerequisite => {
        if (prerequisite.type === 'level') {
          return playerState.level >= prerequisite.minLevel;
        } else if (prerequisite.type === 'quest_completed') {
          return playerState.completedQuestIds.has(prerequisite.questId);
        }
      });
    });

    return availableQuests;
  }

  public acceptQuest(playerState: IRuntimeCharacter, quest: IRuntimeQuest) {
    playerState.activeQuests.push(quest);
  }
}
