import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import type { NpcStateStats } from '../../domain/types/npc-session.type';
import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';

export interface NpcSessionFacadePort {
  move(mobId: string, position: IPositionTile, now: number): void;
  applyDamage(id: string, amount: number): IReceiveDamageResult | undefined;
  cancelAttack(id: string): void;
  setState(id: string, state: NpcStateStats): void;
  setLastAttackAt(id: string, lastAttackAt: number): void;
  restoreHp(id: string, amount: number, now: number): number | undefined;
  setMovementLockedUntil(id: string, now: number): void;
}
