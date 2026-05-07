import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';

import { Inject, Injectable } from '@nestjs/common';

import type { CombatActionPlannerPort } from '../ports/combat-action-planner.port';
import {
  RequestUseSkillPayload,
  RequestUseSkillUseCasePort,
} from '../ports/request-use-skill-use-case.port';
import { COMBAT_ACTION_PLANNER_TOKEN } from '../ports/tokens';

@Injectable()
export class RequestUseSkillUseCase implements RequestUseSkillUseCasePort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly registryService: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(COMBAT_ACTION_PLANNER_TOKEN)
    private readonly combatActionPlanner: CombatActionPlannerPort,
  ) {}

  public async execute(payload: RequestUseSkillPayload) {
    const attacker = this.registryService.getByRef(payload.attackerRef);

    if (!attacker) return;

    const skill = this.entityActionFacade.getSkillCombatData(attacker, payload.skillId);

    if (!skill) return;

    await this.combatActionPlanner.execute({
      attackerRef: payload.attackerRef,
      target: payload.target,
      skillId: payload.skillId,
    });
  }
}
