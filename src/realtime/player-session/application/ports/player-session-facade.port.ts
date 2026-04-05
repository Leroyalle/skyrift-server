import type { IPositionTile } from 'src/realtime/shared/types/position.type';
import type { SkillType } from 'src/realtime/skill-session/domain/types/skill-session.type';

import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';

export interface PlayerSessionFacadePort {
  move(characterId: string, position: IPositionTile, now: number): void;
  canUseSkill(skillId: string): boolean;
  getSkillCombatSpec(skillId: string): SkillCombatSpec | null;
  applyDamage(characterId: string, amount: number): IReceiveDamageResult | undefined;
}
export interface SkillCombatSpec {
  skillId: string;
  type: SkillType;
  magnitude?: number;
  areaRadius?: number;
  duration?: number;
  range: number;
}
