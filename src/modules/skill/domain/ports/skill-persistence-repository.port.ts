import type { Skill } from '../entities/skill.entity';

export interface SkillPersistenceRepositoryPort {
  save(skill: Skill): Promise<Skill>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<Skill | null>;
  findByIds(ids: string[]): Promise<Skill[]>;
}
