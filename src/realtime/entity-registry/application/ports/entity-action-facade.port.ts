import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface EntityActionFacadePort {
  move(entityRef: IEntityRef, position: IPositionTile, now: number): void;
}
