import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { IEffect } from '../../domain/types/effect.type';
import type { EffectFacadePort } from '../ports/effect-facade.port';
import { FindEffectsBySkillIdQuery } from '../queries/find-by-skill-id/find-effects-by-skill-id.query';
import { FindEffectsBySkillIdsQuery } from '../queries/find-by-skill-ids/find-effects-by-skill-ids.query';

@Injectable()
export class EffectFacade implements EffectFacadePort {
  constructor(private readonly queryBus: QueryBus) {}

  public findEffectsBySkillId(skillId: string): Promise<IEffect[]> {
    return this.queryBus.execute(new FindEffectsBySkillIdQuery(skillId));
  }

  public findEffectsBySkillIds(skillIds: string[]): Promise<IEffect[]> {
    return this.queryBus.execute(new FindEffectsBySkillIdsQuery(skillIds));
  }
}
