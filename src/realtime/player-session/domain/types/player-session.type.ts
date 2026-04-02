import type {
  BaseStats,
  CombatStats,
  PositionStats,
} from 'src/common/domain/types/runtime-stats.type';
import type { Appearance } from 'src/common/domain/vo/appearance.vo';

export type RuntimeSkill = {
  skillId: string;
  level: number;
  cooldownMs: number;
  lastUsedAt: number | null;
  id: string;
};

export interface IPlayerSession {
  userId: string;
  characterId: string;
  name: string;
  level: number;

  baseStats: BaseStats;
  position: PositionStats;
  combat: CombatStats;

  appearance: Appearance;

  skillsById: Map<string, RuntimeSkill>;
  bagId: string;
  equipmentId: string;

  dirty: boolean;
}

export type PlayerSessionSnapshot = Readonly<
  Omit<IPlayerSession, 'dirty' | 'appearance'> & {
    appearance: ReturnType<Appearance['snapshot']>;
    type: 'player';
  }
>;
