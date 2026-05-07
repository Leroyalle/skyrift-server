import { randomUUID } from 'node:crypto';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { OwnedSkill } from '../../domain/entities/owned-skill.entity';
import { OwnedSkillPersistenceRepositoryPort } from '../../domain/ports/owned-skill-persistence-repository.port';
import { IOwnedSkill } from '../../domain/types/owned-skill.type';
import type { OwnedSkillFacadePort } from '../ports/owned-skill-facade.port';
import { OWNED_SKILL_REPOSITORY_TOKEN } from '../ports/tokens';
import { FindOwnedSkillsQuery } from '../queries/find-owned-skills/find-owned-skills.query';

@Injectable()
export class OwnedSkillFacade implements OwnedSkillFacadePort {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(OWNED_SKILL_REPOSITORY_TOKEN)
    private readonly repository: OwnedSkillPersistenceRepositoryPort,
  ) {}

  public findOwnedSkills(props: IEntityRef) {
    return this.queryBus.execute(new FindOwnedSkillsQuery(props));
  }

  public async create(entity: Omit<IOwnedSkill, 'id'>): Promise<IOwnedSkill> {
    const domain = OwnedSkill.create({ id: randomUUID(), ...entity });
    const result = await this.repository.save(domain);
    return result.snapshot();
  }

  public remove(id: OwnedSkill['id']): Promise<void> {
    return this.repository.remove(id);
  }
}
