import type {
  BaseStats,
  CombatStats,
  PositionStats,
} from 'src/common/domain/types/runtime-stats.type';
import type { Appearance } from 'src/common/domain/vo/appearance.vo';

import { type ISkillSession, SkillSession } from '../../../skill-session';

export interface IPlayerSession {
  userId: string;
  id: string;
  name: string;
  level: number;

  baseStats: BaseStats;
  position: PositionStats;
  combat: CombatStats;

  appearance: Appearance;

  skillsById: Map<string, SkillSession>;
  bagId: string;
  equipmentId: string;

  dirty: boolean;
}

export type PlayerSessionSnapshot = Readonly<
  Omit<IPlayerSession, 'dirty' | 'appearance' | 'skillsById'> & {
    appearance: ReturnType<Appearance['snapshot']>;
    type: 'player';
    skillsById: Map<string, ISkillSession>;
  }
>;
