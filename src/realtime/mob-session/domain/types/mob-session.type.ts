import type {
  BaseStats,
  CombatStats,
  PositionStats,
} from 'src/common/domain/types/runtime-stats.type';
import type { Appearance } from 'src/common/domain/vo/appearance.vo';

export interface IMobSession {
  userId: string;
  characterId: string;
  name: string;
  id: string;
  level: number;

  baseStats: BaseStats;
  position: PositionStats;
  combat: CombatStats;

  appearance: Appearance;

  // bagId: string;
  equipmentId: string;

  dirty: boolean;
}
