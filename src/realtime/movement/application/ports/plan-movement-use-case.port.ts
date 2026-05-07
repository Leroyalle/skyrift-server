import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export type PlanMovementUseCasePayload = {
  entity: {
    characterId: string;
    position: IPositionTile;
  };
  location: {
    id: string;
    passableMap: number[][];
    tileWidth: number;
    tileHeight: number;
  };
  targetTile: IPositionTile;
};

export interface PlanMovementUseCasePort {
  execute(payload: PlanMovementUseCasePayload): Promise<void>;
}
