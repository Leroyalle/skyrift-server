import type { StateStats } from 'src/common/domain/types/runtime-stats.type';
import type { MobStateStats } from 'src/realtime/mob-session';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';
import type { SkillType } from 'src/realtime/skill-session/domain/types/skill-session.type';

export interface IApplyDamageResult {
  hp: number;
  isAlive: boolean;
}

export interface EntityActionFacadePort {
  move(entityRef: IEntityRef, position: IPositionTile, now: number): void;
  canUseSkill(entityRef: IEntityRef, skillId: string): boolean;
  getSkillCombatData(entityRef: IEntityRef, skillId: string): SkillCombatSpec | null;
  applyHit(
    entityRef: IEntityRef,
    amount: number,
    attackerRef: IEntityRef,
  ): IApplyDamageResult | undefined;
  cancelAttack(entityRef: IEntityRef): void;
  setState(payload: SetStatePayload): void;
  setLastAttackAt(entityRef: IEntityRef, lastAttackAt: number): void;
  setMovementLockedUntil(entityRef: IEntityRef, now: number): void;
  applySkillCooldown(entityRef: IEntityRef, skillId: string, now: number): number | undefined;
}

export type SetStatePayload =
  | { entityRef: IEntityRef & { type: 'player' }; state: StateStats }
  | { entityRef: IEntityRef & { type: 'mob' }; state: MobStateStats }
  | { entityRef: IEntityRef & { type: 'npc' }; state: null }
  | { entityRef: IEntityRef; state: StateStats };

export interface SkillCombatSpec {
  skillId: string;
  magnitude?: number;
  areaRadius?: number;
  duration?: number;
  range: number;
  cooldownMs: number;
  lastUsedAt: number;
  cooldownEnd: number;
  id: string;
  type: SkillType;
}
