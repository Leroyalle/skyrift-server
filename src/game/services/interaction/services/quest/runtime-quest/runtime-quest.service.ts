import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { isProgressOfType } from 'src/game/lib/guards/is-progress-of-type';
import { isSameReference } from 'src/game/lib/guards/is-same-referense';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { Quest } from 'src/quest/entities/quest.entity';
import { StepType } from 'src/quest/types/quest-step.type';

import { Injectable } from '@nestjs/common';

import { QuestProgressResult } from './types/quest-progress-result';
import { IRuntimeQuest } from './types/runtime-quest.type';

@Injectable()
export class RuntimeQuestService {
  public getAvailableQuests(playerState: IRuntimeCharacter, quests: Quest[]): Quest[] {
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

  public isQuestIsActive(playerState: IRuntimeCharacter, quest: Quest) {
    return playerState.activeQuests.some(activeQuest => activeQuest.quest.id === quest.id);
  }

  public acceptQuest(playerState: IRuntimeCharacter, quest: IRuntimeQuest) {
    if (playerState.activeQuests.some(activeQuest => activeQuest.quest.id === quest.quest.id))
      return;
    playerState.activeQuests.push(quest);
  }

  public onKillEntity(entity: IRuntimeCharacter, victim: TRuntimeEntity): QuestProgressResult {
    for (const quest of entity.activeQuests) {
      const result = this.progressKillStep(quest, entity, victim);
      if (result.type !== 'none') return result;
    }

    return { type: 'none' };
  }

  private progressKillStep(
    quest: IRuntimeQuest,
    entity: IRuntimeCharacter,
    victim: TRuntimeEntity,
  ): QuestProgressResult {
    const questStep = quest.quest.steps[quest.stepIndex];
    if (questStep.type !== StepType.Kill) return { type: 'none' };
    if (!isSameReference(victim, questStep.entityRef)) return { type: 'none' };
    const progress = quest.progress;
    if (!isProgressOfType<StepType.Kill>(progress)) return { type: 'none' };
    if (progress.current >= progress.required) return { type: 'none' };
    progress.current += 1;

    if (progress.current >= progress.required) {
      const result = this.snapToNextStep(quest, entity);
      return result;
    }

    return {
      type: 'progress',
      current: progress.current,
      required: progress.required,
      questId: quest.quest.id,
      stepIndex: quest.stepIndex,
    };
  }

  private snapToNextStep(quest: IRuntimeQuest, entity: IRuntimeCharacter): QuestProgressResult {
    const nextStep = quest.quest.steps[quest.stepIndex + 1];

    if (!nextStep) {
      this.completeQuest(quest, entity);
      return { type: 'quest_completed', questId: quest.quest.id };
    }

    quest.stepIndex += 1;

    switch (nextStep.type) {
      case StepType.Kill:
        quest.progress = { required: nextStep.count, current: 0 };
        break;

      case StepType.Talk:
        quest.progress = { npcId: nextStep.npcId };
        break;

      case StepType.Collect:
        quest.progress = { required: nextStep.count, current: 0 };
        break;

      default:
        break;
    }

    return { type: 'step_completed', questId: quest.quest.id, nextStepIndex: quest.stepIndex };
  }

  private completeQuest(quest: IRuntimeQuest, entity: IRuntimeCharacter) {
    entity.activeQuests = entity.activeQuests.filter(
      activeQuest => activeQuest.quest.id !== quest.quest.id,
    );
    quest.completedAt = new Date();
    entity.completedQuestIds.add(quest.quest.id);
  }
}
