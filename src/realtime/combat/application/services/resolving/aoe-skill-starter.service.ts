import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { AoeZoneLifecycleService } from '../zones/aoe-zone-lifecycle.service';

interface Payload {
  attackerRef: IEntityRef;
  skillId: string;
  area: IPositionTile;
}

type Return = { cooldown: CooldownResult };

export type CooldownResult = {
  skillId: string;
  cooldownEnd: number;
};

@Injectable()
export class AoESkillStarterService {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    private readonly aoeZoneLifecycleService: AoeZoneLifecycleService,
  ) {}

  public execute(payload: Payload): Return | undefined {
    const attacker = this.entityResolver.getByRef(payload.attackerRef);

    if (!attacker) return;

    const skill = this.entityActionFacade.getSkillCombatData(attacker, payload.skillId);

    if (!skill) return;

    console.log('applyAoESkill', skill);

    if (skill.type !== 'AoE') return;

    console.log('BEFORE SPAWN AOE ZONE');

    const now = Date.now();

    if (!skill.duration || !skill.areaRadius) return;

    this.aoeZoneLifecycleService.spawn({
      casterRef: { id: attacker.id, type: attacker.type, locationId: attacker.position.locationId },
      stats: {
        duration: skill.duration,
        radius: skill.areaRadius,
        skillId: skill.skillId,
        effects: [],
      },
      area: payload.area,
    });

    this.entityActionFacade.setLastAttackAt(attacker, now);
    const cooldownEnd = this.entityActionFacade.applySkillCooldown(attacker, skill.skillId, now);
    // characterSkill.lastUsedAt = now;
    // characterSkill.cooldownEnd = now + characterSkill.skill.cooldownMs;

    // attacker.lastAttackAt = now;

    return {
      cooldown: {
        cooldownEnd: cooldownEnd,
        skillId: skill.skillId,
      },
    };
  }
}
