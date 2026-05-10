import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface RequestMovePort {
  execute(payload: RequestMovePayload): Promise<void>;
}

export interface RequestMovePayload {
  targetTile: IPositionTile;
  characterId: string;
  userId: string;
}
