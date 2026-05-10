import type { EffectPersistenceRepositoryPort } from 'src/modules/effect/domain/ports/effect-persistence-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EFFECT_PERSISTENCE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindEffectsBySkillIdQuery } from './find-effects-by-skill-id.query';

@QueryHandler(FindEffectsBySkillIdQuery)
export class FindEffectsBySkillIdHandler implements IQueryHandler<FindEffectsBySkillIdQuery> {
  constructor(
    @Inject(EFFECT_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly effectRepository: EffectPersistenceRepositoryPort,
  ) {}

  public async execute(query: FindEffectsBySkillIdQuery) {
    const effects = await this.effectRepository.findBySkillId(query.skillId);
    return effects.map(effect => effect.snapshot());
  }
}
