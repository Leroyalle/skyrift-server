import type { ISkill } from '../../domain/types/skill.type';

export interface SkillFacadePort {
  findByIds(ids: string[]): Promise<ISkill[]>;
  create(payload: Omit<ISkill, 'id'>): Promise<ISkill>;
  delete(id: string): Promise<void>;
}
