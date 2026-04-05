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
  getSkillCombatSpec(entityRef: IEntityRef, skillId: string): SkillCombatSpec | null;
  applyHit(
    entityRef: IEntityRef,
    amount: number,
    attackerRef: IEntityRef,
  ): IApplyDamageResult | undefined;
}

export interface SkillCombatSpec {
  skillId: string;
  type: SkillType;
  magnitude?: number;
  areaRadius?: number;
  duration?: number;
  range: number;
}
