import {
  MOB_SESSION_FACADE_TOKEN,
  type MobSessionFacadePort,
  type MobSessionSnapshot,
} from 'src/realtime/mob-session';
import { type IMovementQueue } from 'src/realtime/movement';
import { isEntityCombatStatus } from 'src/realtime/shared/lib/guards/is-entity-combat-status.lib';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AiStateSyncService {
  constructor(
    @Inject(MOB_SESSION_FACADE_TOKEN)
    private readonly mobSessionFacade: MobSessionFacadePort,
  ) {}

  public normalizeIdleState(
    mob: MobSessionSnapshot,
    currentPos: IPositionTile,
    spawnPos: IPositionTile,
    path: IMovementQueue | null,
  ): boolean {
    const isReturned = this.isReturned(currentPos, spawnPos, mob);
    const isBum = this.isBum(path, mob);

    if (!isReturned && !isBum) {
      return false;
    }

    this.mobSessionFacade.setState(mob.id, { current: 'idle' });
    return true;
  }

  private isReturned(currentPos: IPositionTile, spawnPos: IPositionTile, mob: MobSessionSnapshot) {
    return (
      currentPos.x === spawnPos.x && currentPos.y === spawnPos.y && mob.state.current === 'return'
    );
  }

  private isBum(path: IMovementQueue | null, mob: MobSessionSnapshot) {
    return (!path || path.steps.length === 0) && !isEntityCombatStatus(mob.state.current);
  }
}
