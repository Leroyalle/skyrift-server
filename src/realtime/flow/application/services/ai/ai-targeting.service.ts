import {
  REQUEST_ATTACK_MOVE_USE_CASE_TOKEN,
  type RequestAttackMoveUseCasePort,
} from 'src/realtime/combat';
import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import { SPATIAL_GRID_INDEX_TOKEN, type SpatialGridIndexPort } from 'src/realtime/spatial-grid';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AiTargetingService {
  constructor(
    @Inject(REQUEST_ATTACK_MOVE_USE_CASE_TOKEN)
    private readonly requestAttackMoveUseCase: RequestAttackMoveUseCasePort,
    @Inject(SPATIAL_GRID_INDEX_TOKEN) private readonly spatialGridService: SpatialGridIndexPort,
  ) {}

  public async tryAttackNearbyPlayer(mob: MobSessionSnapshot): Promise<boolean> {
    if (!this.canAcquireNearbyTarget(mob)) return false;

    const { entities } = this.spatialGridService.queryRadius(
      mob.position.locationId,
      mob.position.x,
      mob.position.y,
      mob.baseStats.triggerRange,
      'player',
    );

    const target = entities?.[0];

    if (!target) return false;

    await this.requestAttackMoveUseCase.execute({
      attackerRef: mob,
      victimRef: target,
    });

    return true;
  }

  public async tryAttackAggroTarget(mob: MobSessionSnapshot): Promise<boolean> {
    if (!this.hasNewAggroTarget(mob)) return false;

    const target = mob.combat.aggro.getCurrentTarget;
    if (!target) return false;

    await this.requestAttackMoveUseCase.execute({
      attackerRef: mob,
      victimRef: target,
    });

    return true;
  }

  public async attackTarget(mob: MobSessionSnapshot, victimRef: IEntityRef) {
    await this.requestAttackMoveUseCase.execute({
      attackerRef: mob,
      victimRef,
    });
  }

  private canAcquireNearbyTarget(mob: MobSessionSnapshot): boolean {
    return (
      !mob.combat.currentTargetRef &&
      mob.state.current !== 'return' &&
      mob.state.current !== 'pursue' &&
      mob.state.current !== 'attacking'
    );
  }

  private hasNewAggroTarget(mob: MobSessionSnapshot): boolean {
    const oldTarget = mob.combat.currentTargetRef;
    const newTarget = mob.combat.aggro.getCurrentTarget;
    return oldTarget?.id !== newTarget?.id || oldTarget?.type !== newTarget?.type;
  }
}
