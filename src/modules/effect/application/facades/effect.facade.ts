import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Effect } from '../../domain/entities/effect.entity';
import { EffectPersistenceRepositoryPort } from '../../domain/ports/effect-persistence-repository.port';
import type { IEffect } from '../../domain/types/effect.type';
import type { EffectFacadePort } from '../ports/effect-facade.port';
import { EFFECT_PERSISTENCE_REPOSITORY_TOKEN } from '../ports/tokens';
import { FindEffectsBySkillIdQuery } from '../queries/find-by-skill-id/find-effects-by-skill-id.query';
import { FindEffectsBySkillIdsQuery } from '../queries/find-by-skill-ids/find-effects-by-skill-ids.query';

@Injectable()
export class EffectFacade implements EffectFacadePort {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(EFFECT_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly effectRepository: EffectPersistenceRepositoryPort,
  ) {}

  public findEffectsBySkillId(skillId: string): Promise<IEffect[]> {
    return this.queryBus.execute(new FindEffectsBySkillIdQuery(skillId));
  }

  public findEffectsBySkillIds(skillIds: string[]): Promise<IEffect[]> {
    return this.queryBus.execute(new FindEffectsBySkillIdsQuery(skillIds));
  }

  public async create(entity: Omit<IEffect, 'id'>): Promise<IEffect> {
    const domain = Effect.create({ id: randomUUID(), ...entity });
    const result = await this.effectRepository.save(domain);
    return result.snapshot();
  }

  public async remove(id: string): Promise<void> {
    await this.effectRepository.remove(id);
  }
}
