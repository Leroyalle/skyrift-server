import type { StateStats } from 'src/common/domain/types/runtime-stats.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';
import type { SkillType } from 'src/realtime/skill-session/domain/types/skill-session.type';

import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';

export interface PlayerSessionFacadePort {
  move(characterId: string, position: IPositionTile, now: number): void;
  canUseSkill(skillId: string): boolean;
  getSkillCombatSpec(skillId: string): SkillCombatSpec | null;
  applyDamage(characterId: string, amount: number): IReceiveDamageResult | undefined;
  cancelAttack(id: string): void;
  changeLocation(id: string, x: number, y: number, locationId: string): void;
  setState(id: string, state: StateStats): void;
  setLastAttackAt(id: string, lastAttackAt: number): void;
  applySkillCooldown(id: string, skillId: string, now: number): number | undefined;
  setMovementLockedUntil(id: string, now: number): void;
}
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
