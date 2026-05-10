import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import type { MobStateStats } from '../../domain/types/mob-session.type';
import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';

export interface MobSessionFacadePort {
  move(mobId: string, position: IPositionTile, now: number): void;
  applyDamage(
    id: string,
    amount: number,
    attackerRef: IEntityRef,
  ): IReceiveDamageResult | undefined;
  cancelAttack(id: string): void;
  setCurrentTarget(id: string, targetRef: IEntityRef): void;
  setState(id: string, state: MobStateStats): void;
  setLastAttackAt(id: string, lastAttackAt: number): void;
  setMovementLockedUntil(id: string, now: number): void;
  respawn(id: string): void;
  scheduleNextThinkAt(id: string, now: number, delay: number): void;
  restoreHp(id: string, amount: number, now: number): number | undefined;
}
