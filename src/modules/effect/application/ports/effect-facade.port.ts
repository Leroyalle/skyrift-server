import type { IEffect } from '../../domain/types/effect.type';

export interface EffectFacadePort {
  findEffectsBySkillId(skillId: string): Promise<IEffect[]>;
  findEffectsBySkillIds(skillIds: string[]): Promise<IEffect[]>;
  create(entity: Omit<IEffect, 'id'>): Promise<IEffect>;
  remove(id: string): Promise<void>;
}
