import type { MobSessionFacadePort } from 'src/realtime/mob-session/application/ports/mob-session-facade.port';
import { MOB_SESSION_FACADE_TOKEN } from 'src/realtime/mob-session/application/ports/tokens';
import type { PlayerSessionFacadePort } from 'src/realtime/player-session/application/ports/player-session-facade.port';
import { PLAYER_SESSION_FACADE_TOKEN } from 'src/realtime/player-session/application/ports/tokens';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type {
  EntityActionFacadePort,
  IApplyDamageResult,
  SkillCombatSpec,
} from '../ports/entity-action-facade.port';

@Injectable()
export class EntityActionFacade implements EntityActionFacadePort {
  constructor(
    @Inject(PLAYER_SESSION_FACADE_TOKEN)
    private readonly playerSessionFacade: PlayerSessionFacadePort,
    @Inject(MOB_SESSION_FACADE_TOKEN)
    private readonly mobSessionFacade: MobSessionFacadePort,
  ) {}

  public move(entityRef: IEntityRef, position: IPositionTile, now: number): void {
    if (entityRef.type === 'player') {
      this.playerSessionFacade.move(entityRef.id, position, now);
    } else if (entityRef.type === 'mob') {
      this.mobSessionFacade.move(entityRef.id, position, now);
    }
  }

  public canUseSkill(entityRef: IEntityRef, skillId: string): boolean {
    if (entityRef.type === 'player') {
      return this.playerSessionFacade.canUseSkill(skillId);
    }
    return false;
  }

  public getSkillCombatSpec(entityRef: IEntityRef, skillId: string): SkillCombatSpec | null {
    if (entityRef.type === 'player') {
      return this.playerSessionFacade.getSkillCombatSpec(skillId);
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
}
