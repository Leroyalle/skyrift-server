import type { Effect } from '../entities/effect.entity';

export interface EffectPersistenceRepositoryPort {
  save(effect: Effect): Promise<void>;
  remove(id: Effect['id']): Promise<void>;
  findById(id: Effect['id']): Promise<Effect | null>;
  findBySkillId(skillId: Effect['skillId']): Promise<Effect[]>;
  findBySkillsIds(skillIds: Effect['skillId'][]): Promise<Effect[]>;
}
