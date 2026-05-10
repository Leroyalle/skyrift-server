import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export type MovementQueue = {
  steps: IPositionTile[];
};

export type IMovementQueue = MovementQueue;
