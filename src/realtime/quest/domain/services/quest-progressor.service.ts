import type { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';
import type { Quest } from 'src/modules/quest/domain/entities/quest.entity';
import { StepType } from 'src/modules/quest/domain/types/quest-step.type';
import { isSameReference } from 'src/realtime/shared/lib/guards/is-same-referense';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

type QuestProgressResult =
  | { type: 'no-change' }
  | { type: 'progressed' }
  | { type: 'step-advanced' }
  | { type: 'quest-completed' };

export class QuestProgressor {
  public static progressKillStep(
    playerQuest: PlayerQuest,
    quest: Quest,
    victimRef: IEntityRef,
  ): QuestProgressResult {
    const questSnapshot = quest.snapshot();
    const playerQuestSnapshot = playerQuest.snapshot();

    const questStep = questSnapshot.steps[playerQuestSnapshot.stepIndex];

    if (questStep.type !== StepType.Kill) {
      return { type: 'no-change' };
    }
    if (!isSameReference(victimRef, questStep.entityRef)) {
      return { type: 'no-change' };
    }

    return playerQuest.progress(quest);
  }
}
