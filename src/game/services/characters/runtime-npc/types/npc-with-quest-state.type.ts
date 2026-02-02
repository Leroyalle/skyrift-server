import { IRuntimeNpc } from './runtime-npc.type';

export interface INpcWithQuestState extends IRuntimeNpc {
  questState: TQuestState;
}

export type TQuestState = 'available' | 'active' | 'none';
