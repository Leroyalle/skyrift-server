export type QuestProgressResult =
  | { type: 'none' }
  | {
      type: 'progress';
      questId: string;
      stepIndex: number;
      current: number;
      required: number;
    }
  | {
      type: 'step_completed';
      questId: string;
      nextStepIndex: number;
    }
  | {
      type: 'quest_completed';
      questId: string;
    };
