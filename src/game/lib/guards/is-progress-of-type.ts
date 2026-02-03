import { QuestProgress } from 'src/quest/types/quest-progress.type';
import { StepType } from 'src/quest/types/quest-step.type';

export function isProgressOfType<T extends StepType>(
  progress: QuestProgress<StepType> | null,
): progress is QuestProgress<T> {
  return progress !== null;
}
