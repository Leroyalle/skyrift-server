import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';

export interface MobSessionFacadePort {
  move(mobId: string, position: IPositionTile, now: number): void;
  applyDamage(
    id: string,
    amount: number,
    attackerRef: IEntityRef,
  ): IReceiveDamageResult | undefined;
  // updateAggro(id: string, entityRef: IEntityRef, amount: number): void;
}
