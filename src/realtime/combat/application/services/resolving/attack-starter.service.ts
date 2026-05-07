import type { ProjectileQueueRepositoryPort } from 'src/realtime/combat/domain/ports/projectile-queue-repository.port';
import type { ActionType } from 'src/realtime/combat/domain/types/action-queue.type';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  type EntityActionFacadePort,
} from 'src/realtime/entity-registry';
import type { TDirection } from 'src/realtime/movement';
import { getDirection } from 'src/realtime/shared/lib/helpers/get-direction.lib';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import { PROJECTILE_REPOSITORY_TOKEN } from '../../ports/tokens';

interface StartAttackingPayload {
  attacker: Entity;
  victim: Entity;
  action: {
    skill: SkillSpecs | null;
    actionType: ActionType;
  };
  context: {
    now: number;
    tileSize: number;
  };
}

interface Entity extends IEntityRef {
  position: IPositionTile & { locationId: string };
}

interface SkillSpecs {
  cooldownMs: number;
  lastUsedAt: number;
  cooldownEnd: number;
  id: string;
}

interface AttackStartedResult {
  attackerRef: IEntityRef & {
    direction: TDirection;
  };
  victimRef: IEntityRef;
  actionType: ActionType;
  skillId: string | null;
  cooldownEnd: number | null;
  locationId: string;
}

@Injectable()
export class AttackStarterService {
  constructor(
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(PROJECTILE_REPOSITORY_TOKEN)
    private readonly projectileQueueRepository: ProjectileQueueRepositoryPort,
  ) {}

  public execute(payload: StartAttackingPayload): AttackStartedResult {
    const attackerDirection = getDirection(payload.attacker.position, payload.victim.position);

    let cooldown: AttackStartedResult['cooldownEnd'] = null;

    // TODO: фасад заюзать
    this.entityActionFacade.setLastAttackAt(payload.attacker, payload.context.now);

    if (payload.action.skill) {
      const cooldownEnd = payload.context.now + payload.action.skill.cooldownMs;
      payload.action.skill.lastUsedAt = payload.context.now;
      payload.action.skill.cooldownEnd = cooldownEnd;
      cooldown = cooldownEnd;
    }

    this.projectileQueueRepository.set(payload.attacker, {
      victimRef: payload.victim,
      skillId: payload.action.skill ? payload.action.skill.id : null,
      startedAt: payload.context.now,
      startedTile: getTileByPosition(
        payload.attacker.position.x,
        payload.attacker.position.y,
        payload.context.tileSize,
      ),
    });

    return {
      actionType: payload.action.actionType,
      attackerRef: {
        direction: attackerDirection,
        id: payload.attacker.id,
        type: payload.attacker.type,
      },
      victimRef: {
        id: payload.victim.id,
        type: payload.victim.type,
      },
      skillId: payload.action.skill ? payload.action.skill.id : null,
      cooldownEnd: cooldown,
      locationId: payload.attacker.position.locationId,
    };
  }
}
