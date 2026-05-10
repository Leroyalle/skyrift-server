import type {
  BaseStats,
  CombatStats,
  PositionStats,
  StateStats,
} from 'src/common/domain/types/runtime-stats.type';
import type { Appearance } from 'src/common/domain/vo/appearance.vo';
import type { FactionName } from 'src/realtime/faction';

import type { AggroTableDo } from '../do/aggro-table.do';

export interface IMobSession {
  name: string;
  level: number;
  id: string;

  baseStats: MobBaseStats;
  position: PositionStats;
  combat: MobCombatStats;
  state: MobStateStats;
  lifecycle: MobLifecycle;
  spawn: MobSpawnPoint;

  faction: FactionName;

  appearance: Appearance;

  equipmentId: string;

  dirty: boolean;
}

export type MobCombatStats = {
  aggro: AggroTableDo;
} & CombatStats;

export type MobStateStats = {
  current: StateStats['current'] | 'return';
};

export type MobLifecycle = {
  respawnIn: number;
  nextThinkAt: number;
};

export type MobSpawnPoint = {
  spawnId: string;
  position: PositionStats;
};

export type MobSessionProps = {
  name: string;
  level: number;
  id: string;
  baseStats: MobBaseStats;
  position: PositionStats;
  combat: MobCombatStats;
  lifecycle: MobLifecycle;
  spawn: MobSpawnPoint;
  faction: FactionName;
  appearance: { body: string; head: string };
  equipmentId: string;
};

interface MobBaseStats extends BaseStats {
  chaseSpeed: number;
  triggerRange: number;
}

export type MobSessionSnapshot = Readonly<
  Omit<IMobSession, 'dirty' | 'appearance'> & {
    appearance: ReturnType<Appearance['snapshot']>;
    type: 'mob';
  }
>;

export type MobSessionPayload = Omit<MobSessionProps, 'appearance' | 'combat'> & {
  appearance: Appearance;
  combat: Omit<MobSessionProps['combat'], 'aggro'>;
};
