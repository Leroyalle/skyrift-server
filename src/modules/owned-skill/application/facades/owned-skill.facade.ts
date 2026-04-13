import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { OwnedSkillFacadePort } from '../ports/owned-skill-facade.port';
import { FindOwnedSkillsQuery } from '../queries/find-owned-skills/find-owned-skills.query';

@Injectable()
export class OwnedSkillFacade implements OwnedSkillFacadePort {
  constructor(private readonly queryBus: QueryBus) {}

  public findOwnedSkills(props: IEntityRef) {
    return this.queryBus.execute(new FindOwnedSkillsQuery(props));
  }
}
