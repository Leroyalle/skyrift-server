import type {
  BaseStats,
  CombatStats,
  PositionStats,
  StateStats,
} from 'src/common/domain/types/runtime-stats.type';
import type { Appearance } from 'src/common/domain/vo/appearance.vo';
import type { FactionName } from 'src/realtime/faction';

export interface IMobSession {
  name: string;
  level: number;
  id: string;

  baseStats: MobBaseStats;
  position: PositionStats;
  combat: CombatStats;
  state: MobStateStats;

  faction: FactionName;

  appearance: Appearance;

  equipmentId: string;

  dirty: boolean;
}
export type MobStateStats = {
  current: StateStats['current'] | 'return';
};

export type MobSessionProps = {
  name: string;
  level: number;
  id: string;
  baseStats: MobBaseStats;
  position: PositionStats;
  combat: CombatStats;
  faction: FactionName;
  appearance: { body: string; head: string };
  equipmentId: string;
};

interface MobBaseStats extends BaseStats {
  chaseSpeed: number;
}

export type MobSessionSnapshot = Readonly<
  Omit<IMobSession, 'dirty' | 'appearance'> & {
    appearance: ReturnType<Appearance['snapshot']>;
    type: 'mob';
  }
>;
