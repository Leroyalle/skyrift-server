import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface MobSessionFacadePort {
  move(mobId: string, position: IPositionTile, now: number): void;
}
