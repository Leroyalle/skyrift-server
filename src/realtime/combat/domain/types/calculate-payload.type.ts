import type { BaseStats, CombatStats } from 'src/common/domain/types/runtime-stats.type';

import type { ActionType } from './action-queue.type';

export interface CalculatePayload {
  power: DamagePower;
  victim: CombatActorStats;
  skill?: SkillCombatSpec;
  source: DamageSource;
}

type DamagePower =
  | {
      mode: 'attacker_stats';
      attacker: CombatActorStats;
    }
  | {
      mode: 'fixed';
      amount: number;
    };

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
