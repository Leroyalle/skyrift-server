import { assertCountProgress } from '../lib/assert-count-progress';
import type { IPlayerQuest } from '../types/player-quest.type';
import { StepType } from '../types/quest-step.type';

import type { Quest } from './quest.entity';

type AdvanceStepResult = { type: 'step-advanced' } | { type: 'quest-completed' };

type QuestProgressResult =
  | { type: 'no-change' }
  | { type: 'progressed' }
  | { type: 'step-advanced' }
  | { type: 'quest-completed' };

export class PlayerQuest {
  private constructor(private readonly props: IPlayerQuest) {}

  public static create(props: IPlayerQuest): PlayerQuest {
    return new PlayerQuest(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get completedAt(): Date | null {
    return this.props.completedAt ? new Date(this.props.completedAt) : null;
  }

  public get questId(): string {
    return this.props.questId;
  }

  public get characterId(): string {
    return this.props.characterId;
  }

  private markAsCompleted() {
    this.props.completedAt = new Date();
  }

  public progress(quest: Quest): QuestProgressResult {
    const progress = this.props.progress;
    if (!progress) return { type: 'no-change' };

    switch (progress.type) {
      case 'kill':
      case 'collect': {
        assertCountProgress(progress);

        if (progress.current < progress.required) {
          progress.current += 1;
        }

        this.props.progress = progress;

        if (progress.current >= progress.required) {
          const result = this.advanceStep(quest);
          return {
            type: result.type,
          };
        }

        return { type: 'progressed' };
      }

      case 'talk': {
        const result = this.advanceStep(quest);
        return { type: result.type };
      }

      default:
        throw new Error('Unsupported increment progress type');
    }
  }

  public advanceStep(quest: Quest): AdvanceStepResult {
    const questSnapshot = quest.snapshot();

    if (this.props.stepIndex >= questSnapshot.steps.length) {
      throw new Error("You can't advance the step");
    }

    const nextStep = questSnapshot.steps[this.props.stepIndex + 1];

    if (!nextStep) {
      this.markAsCompleted();
      return { type: 'quest-completed' };
    }

    switch (nextStep.type) {
      case StepType.Kill:
        this.props.progress = { required: nextStep.count, current: 0, type: 'kill' };
        break;

      case StepType.Talk:
        this.props.progress = { npcId: nextStep.npcId, type: 'talk' };
        break;

      case StepType.Collect:
        this.props.progress = { required: nextStep.count, current: 0, type: 'collect' };
        break;

      default:
        throw new Error('Unsupported quest step type');
    }

    this.props.stepIndex += 1;
    return { type: 'step-advanced' };
  }

  public snapshot(): Readonly<IPlayerQuest> {
    return { ...this.props };
  }
}
