import type { EffectPersistenceRepositoryPort } from 'src/modules/effect/domain/ports/effect-persistence-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EFFECT_PERSISTENCE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindEffectsBySkillIdsQuery } from './find-effects-by-skill-ids.query';

@QueryHandler(FindEffectsBySkillIdsQuery)
export class FindEffectsBySkillIdsHandler implements IQueryHandler<FindEffectsBySkillIdsQuery> {
  constructor(
    @Inject(EFFECT_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly effectRepository: EffectPersistenceRepositoryPort,
  ) {}

  public async execute(query: FindEffectsBySkillIdsQuery) {
    const effects = await this.effectRepository.findBySkillsIds(query.skillIds);
    return effects.map(effect => effect.snapshot());
  }
}
