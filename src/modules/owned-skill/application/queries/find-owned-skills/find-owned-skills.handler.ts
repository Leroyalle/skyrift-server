import type { OwnedSkillPersistenceRepositoryPort } from 'src/modules/owned-skill/domain/ports/owned-skill-persistence-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OWNED_SKILL_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindOwnedSkillsQuery } from './find-owned-skills.query';

@QueryHandler(FindOwnedSkillsQuery)
export class FindOwnedSkillsHandler implements IQueryHandler<FindOwnedSkillsQuery> {
  constructor(
    @Inject(OWNED_SKILL_REPOSITORY_TOKEN)
    private readonly skillsRepository: OwnedSkillPersistenceRepositoryPort,
  ) {}

  public async execute(query: FindOwnedSkillsQuery) {
    const skills = await this.skillsRepository.findByOwnerRef({
      id: query.props.id,
      type: query.props.type,
    });

    return skills.map(skill => skill.snapshot());
  }
}
