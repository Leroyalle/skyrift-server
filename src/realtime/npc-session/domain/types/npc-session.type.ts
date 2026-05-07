import type {
  BaseStats,
  CombatStats,
  PositionStats,
  StateStats,
} from 'src/common/domain/types/runtime-stats.type';
import type { Appearance } from 'src/common/domain/vo/appearance.vo';
import type { FactionName } from 'src/realtime/faction';

export interface INpcSession {
  name: string;
  level: number;
  id: string;

  baseStats: NpcBaseStats;
  position: PositionStats;
  combat: CombatStats;
  state: NpcStateStats;

  spawn: NpcSpawnPoint;

  faction: FactionName;

  appearance: Appearance;

  equipmentId: string;

  dirty: boolean;
}

export type NpcStateStats = {
  current: StateStats['current'] | 'return';
};

export type NpcSessionProps = {
  name: string;
  level: number;
  id: string;
  spawn: NpcSpawnPoint;
  baseStats: NpcBaseStats;
  position: PositionStats;
  combat: CombatStats;
  faction: FactionName;
  appearance: { body: string; head: string };
  equipmentId: string;
};

export type NpcSpawnPoint = {
  spawnId: string;
  position: PositionStats;
};

interface NpcBaseStats extends BaseStats {
  chaseSpeed: number;
}

export type NpcSessionSnapshot = Readonly<
  Omit<INpcSession, 'dirty' | 'appearance'> & {
    appearance: ReturnType<Appearance['snapshot']>;
    type: 'npc';
  }
>;
