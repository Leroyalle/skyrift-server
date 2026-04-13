import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { SkillFacadePort } from '../ports/skill-facade.port';
import { FindSkillsByIdsQuery } from '../queries/find-skills-by-ids/find-skills-by-ids.query';

@Injectable()
export class SkillFacade implements SkillFacadePort {
  constructor(private readonly queryBus: QueryBus) {}

  public findByIds(ids: string[]) {
    return this.queryBus.execute(new FindSkillsByIdsQuery(ids));
  }
}
