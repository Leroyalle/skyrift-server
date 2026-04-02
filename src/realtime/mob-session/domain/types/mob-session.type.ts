import type {
  BaseStats,
  CombatStats,
  PositionStats,
} from 'src/common/domain/types/runtime-stats.type';
import type { Appearance } from 'src/common/domain/vo/appearance.vo';

export interface IMobSession {
  name: string;
  level: number;
  mobId: string;

  baseStats: MobBaseStats;
  position: PositionStats;
  combat: CombatStats;

  appearance: Appearance;

  // bagId: string;
  equipmentId: string;

  dirty: boolean;
}

interface MobBaseStats extends BaseStats {
  chaseSpeed: number;
}

export type MobSessionSnapshot = Readonly<
  Omit<IMobSession, 'dirty' | 'appearance'> & {
    appearance: ReturnType<Appearance['snapshot']>;
    type: 'mob';
  }
>;
