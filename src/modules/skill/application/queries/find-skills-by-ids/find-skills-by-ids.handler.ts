import type { SkillPersistenceRepositoryPort } from 'src/modules/skill/domain/ports/skill-persistence-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SKILL_PERSISTENCE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindSkillsByIdsQuery } from './find-skills-by-ids.query';

@QueryHandler(FindSkillsByIdsQuery)
export class FindSkillsByIdsHandler implements IQueryHandler<FindSkillsByIdsQuery> {
  constructor(
    @Inject(SKILL_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly skillRepository: SkillPersistenceRepositoryPort,
  ) {}

  public async execute(query: FindSkillsByIdsQuery) {
    const skills = await this.skillRepository.findByIds(query.ids);
    return skills.map(skill => skill.snapshot());
  }
}
