import type { IQuest } from '../types/quest.type';

export class Quest {
  private constructor(private readonly props: IQuest) {}

  public static create(props: IQuest): Quest {
    return new Quest(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public snapshot(): Readonly<IQuest> {
    return {
      ...this.props,
    };
  }

  public canBeAccepted(input: {
    playerLevel: number;
    activeQuestIds: string[];
    completedQuestIds: string[];
  }): boolean {
    if (input.activeQuestIds.includes(this.id)) return false;
    if (input.completedQuestIds.includes(this.id)) return false;

    return true;
  }
}
