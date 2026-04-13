import type { ISkill } from '../../domain/types/skill.type';

export interface SkillFacadePort {
  findByIds(ids: string[]): Promise<ISkill[]>;
}
