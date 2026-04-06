export interface BaseStats {
  maxHp: number;
  basePhysicalDamage: number;
  baseMagicDamage: number;
  physicalDefense: number;
  magicDefense: number;
  attackSpeed: number;
  attackRange: number;
  walkSpeed: number;
}

export interface CombatStats {
  hp: number;
  isAlive: boolean;
  currentTargetId: string | null;
  lastAttackAt: number;
  lastMoveAt: number;
}

export interface PositionStats {
  locationId: string;
  x: number;
  y: number;
}

export type ActorState = 'idle' | 'moving' | 'attacking' | 'casting' | 'stunned' | 'dead';

export interface StateStats {
  current: ActorState;
}
