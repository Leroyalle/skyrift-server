import type { BaseStats, CombatStats } from 'src/common/domain/types/runtime-stats.type';

import type { ActionType } from './action-queue.type';

export interface CalculatePayload {
  attacker: CombatActorStats;
  victim: CombatActorStats;
  skill?: SkillCombatSpec;
  source: DamageSource;
}

export interface CombatActorStats {
  baseStats: BaseStats;
  combatStats: CombatStats;
  equipmentItemsStats: EquipmentItemStats[];
}

export interface EquipmentItemStats {
  physicalDamage?: number;
  magicDamage?: number;
  physicalDefense?: number;
  magicDefense?: number;
}

export interface DamageSource {
  kind: 'physical' | 'magic' | 'true';
  origin: ActionType;
}

export interface SkillCombatSpec {
  magnitude: number;
}
