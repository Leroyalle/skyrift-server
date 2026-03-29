import type { CollectProgress, KillProgress, TalkProgress } from './quest-progress.type';

export interface IPlayerQuest {
  id: string;
  characterId: string;
  questId: string;
  stepIndex: number;
  progress: KillProgress | CollectProgress | TalkProgress | null;
  completedAt: Date | null;
  // createdAt: Date;
  // updatedAt: Date;
}
