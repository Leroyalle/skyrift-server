import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { CombatActionPlannerPort } from '../ports/combat-action-planner.port';
import { COMBAT_ACTION_PLANNER_TOKEN } from '../ports/tokens';

type Payload = {
  skillId: string;
  attackerRef: IEntityRef;
  target: Target;
};

type Target =
  | {
      kind: 'aoe';
      value: IPositionTile;
    }
  | { kind: 'target'; value: IEntityRef };

@Injectable()
export class RequestUseSkillUseCase {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly registryService: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(COMBAT_ACTION_PLANNER_TOKEN)
    private readonly combatActionPlanner: CombatActionPlannerPort,
  ) {}

  public async execute(payload: Payload) {
    const attacker = this.registryService.getByRef(payload.attackerRef);

    if (!attacker) return;

    const skill = this.entityActionFacade.getSkillCombatSpec(attacker, payload.skillId);

    if (!skill) return;

    await this.combatActionPlanner.execute({
      attackerRef: payload.attackerRef,
      target: payload.target,
      skillId: payload.skillId,
    });
  }
}
