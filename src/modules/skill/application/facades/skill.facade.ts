import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SkillPersistenceRepositoryPort } from '../../domain/ports/skill-persistence-repository.port';
import { ISkill } from '../../domain/types/skill.type';
import { CreateSkillCommand } from '../commands/create-skill/create-skill.command';
import type { SkillFacadePort } from '../ports/skill-facade.port';
import { SKILL_PERSISTENCE_REPOSITORY_TOKEN } from '../ports/tokens';
import { FindSkillsByIdsQuery } from '../queries/find-skills-by-ids/find-skills-by-ids.query';
import { CreateSkillProps } from '../types/create-skill.type';

@Injectable()
export class SkillFacade implements SkillFacadePort {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @Inject(SKILL_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly skillPersistenceRepository: SkillPersistenceRepositoryPort,
  ) {}

  public findByIds(ids: string[]) {
    return this.queryBus.execute(new FindSkillsByIdsQuery(ids));
  }

  public create(payload: CreateSkillProps): Promise<ISkill> {
    return this.commandBus.execute<CreateSkillCommand, ISkill>(new CreateSkillCommand(payload));
  }

  public delete(id: string): Promise<void> {
    return this.skillPersistenceRepository.remove(id);
  }
}
