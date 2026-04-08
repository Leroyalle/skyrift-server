import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface IProjectile {
  victimRef: IEntityRef;
  skillId: string | null;
  startedAt: number;
  startedTile: IPositionTile;
}
