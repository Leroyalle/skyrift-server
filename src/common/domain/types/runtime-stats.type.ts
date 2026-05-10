import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

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
  currentTargetRef: IEntityRef | null;
  lastAttackAt: number;
  lastMoveAt: number;
  lastHpRegenerationTime: number;
}

export interface PositionStats {
  locationId: string;
  x: number;
  y: number;
}

export interface StateStats {
  current: ActorState;
}

export type ActorState =
  | 'idle'
  | 'moving'
  | 'attacking'
  | 'casting'
  | 'stunned'
  | 'dead'
  | 'pursue';
