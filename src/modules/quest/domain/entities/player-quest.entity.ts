import type { IPlayerQuest } from '../types/player-quest.type';
import { StepType } from '../types/quest-step.type';

import type { Quest } from './quest.entity';

export class PlayerQuest {
  private constructor(private readonly props: IPlayerQuest) {}

  public static create(props: IPlayerQuest): PlayerQuest {
    return new PlayerQuest(props);
  }

  public get id(): string {
    return this.props.id;
  }

  private markAsCompleted() {
    this.props.completedAt = new Date();
  }

  public advanceStep(quest: Quest) {
    const questSnapshot = quest.snapshot();

    if (this.props.stepIndex >= questSnapshot.steps.length) {
      throw new Error("You can't advance the step");
    }

    const nextStep = questSnapshot.steps[this.props.stepIndex + 1];

    if (!nextStep) {
      this.markAsCompleted();
      return;
    }

    switch (nextStep.type) {
      case StepType.Kill:
        this.props.progress = { required: nextStep.count, current: 0 };
        break;

      case StepType.Talk:
        this.props.progress = { npcId: nextStep.npcId };
        break;

      case StepType.Collect:
        this.props.progress = { required: nextStep.count, current: 0 };
        break;

      default:
        throw new Error('Unsupported quest step type');
    }

    this.props.stepIndex += 1;
  }

  public snapshot(): Readonly<IPlayerQuest> {
    return { ...this.props };
  }
}
