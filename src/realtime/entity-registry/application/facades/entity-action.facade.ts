import type { StateStats } from 'src/common/domain/types/runtime-stats.type';
import type { MobStateStats } from 'src/realtime/mob-session';
import type { MobSessionFacadePort } from 'src/realtime/mob-session/application/ports/mob-session-facade.port';
import { MOB_SESSION_FACADE_TOKEN } from 'src/realtime/mob-session/application/ports/tokens';
import { NPC_SESSION_FACADE_TOKEN, type NpcSessionFacadePort } from 'src/realtime/npc-session';
import type { PlayerSessionFacadePort } from 'src/realtime/player-session/application/ports/player-session-facade.port';
import { PLAYER_SESSION_FACADE_TOKEN } from 'src/realtime/player-session/application/ports/tokens';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type {
  EntityActionFacadePort,
  IApplyDamageResult,
  SetStatePayload,
  SkillCombatSpec,
} from '../ports/entity-action-facade.port';

@Injectable()
export class EntityActionFacade implements EntityActionFacadePort {
  constructor(
    @Inject(PLAYER_SESSION_FACADE_TOKEN)
    private readonly playerSessionFacade: PlayerSessionFacadePort,
    @Inject(MOB_SESSION_FACADE_TOKEN)
    private readonly mobSessionFacade: MobSessionFacadePort,
    @Inject(NPC_SESSION_FACADE_TOKEN)
    private readonly npcSessionFacade: NpcSessionFacadePort,
  ) {}

  public move(entityRef: IEntityRef, position: IPositionTile, now: number): void {
    if (entityRef.type === 'player') {
      this.playerSessionFacade.move(entityRef.id, position, now);
    } else if (entityRef.type === 'mob') {
      this.mobSessionFacade.move(entityRef.id, position, now);
    }
  }

  public setCurrentTarget(entityRef: IEntityRef, targetRef: IEntityRef): void {
    if (entityRef.type === 'player') {
      this.playerSessionFacade.setCurrentTarget(entityRef.id, targetRef);
    } else if (entityRef.type === 'mob') {
      this.mobSessionFacade.setCurrentTarget(entityRef.id, targetRef);
    }
  }

  public canUseSkill(entityRef: IEntityRef, skillId: string): boolean {
    if (entityRef.type === 'player') {
      return this.playerSessionFacade.canUseSkill(skillId);
    }
    return false;
  }

  public getSkillCombatData(entityRef: IEntityRef, skillId: string): SkillCombatSpec | null {
    if (entityRef.type === 'player') {
      return this.playerSessionFacade.getSkillCombatSpec(entityRef.id, skillId);
    }
    return null;
  }

  public applyHit(
    entityRef: IEntityRef,
    amount: number,
    attackerRef: IEntityRef,
  ): IApplyDamageResult | undefined {
    if (entityRef.type === 'player') {
      return this.playerSessionFacade.applyDamage(entityRef.id, amount);
    } else if (entityRef.type === 'mob') {
      return this.mobSessionFacade.applyDamage(entityRef.id, amount, attackerRef);
    }
  }

  public cancelAttack(entityRef: IEntityRef): void {
    if (entityRef.type === 'player') {
      this.playerSessionFacade.cancelAttack(entityRef.id);
    } else if (entityRef.type === 'mob') {
      this.mobSessionFacade.cancelAttack(entityRef.id);
    }
  }

  public setState(payload: SetStatePayload): void {
    if (payload.entityRef.type === 'player') {
      this.playerSessionFacade.setState(payload.entityRef.id, payload.state as StateStats);
    } else if (payload.entityRef.type === 'mob') {
      this.mobSessionFacade.setState(payload.entityRef.id, payload.state as MobStateStats);
    }
  }

  public restoreHp(entityRef: IEntityRef, amount: number, now: number): number | undefined {
    if (entityRef.type === 'player') {
      return this.playerSessionFacade.restoreHp(entityRef.id, amount, now);
    } else if (entityRef.type === 'mob') {
      return this.mobSessionFacade.restoreHp(entityRef.id, amount, now);
    } else if (entityRef.type === 'npc') {
      return this.npcSessionFacade.restoreHp(entityRef.id, amount, now);
    }
  }

  public setLastAttackAt(entityRef: IEntityRef, lastAttackAt: number): void {
    if (entityRef.type === 'player') {
      this.playerSessionFacade.setLastAttackAt(entityRef.id, lastAttackAt);
    } else if (entityRef.type === 'mob') {
      this.mobSessionFacade.setLastAttackAt(entityRef.id, lastAttackAt);
    }
  }

  public applySkillCooldown(
    entityRef: IEntityRef,
    skillId: string,
    now: number,
  ): number | undefined {
    if (entityRef.type === 'player') {
      return this.playerSessionFacade.applySkillCooldown(entityRef.id, skillId, now);
    }
  }

  public setMovementLockedUntil(entityRef: IEntityRef, now: number): void {
    if (entityRef.type === 'player') {
      this.playerSessionFacade.setMovementLockedUntil(entityRef.id, now);
    } else if (entityRef.type === 'mob') {
      this.mobSessionFacade.setMovementLockedUntil(entityRef.id, now);
    }
  }
}
