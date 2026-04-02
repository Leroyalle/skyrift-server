import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface PathFindingServicePort {
  getPath(
    locationId: string,
    from: IPositionTile,
    to: IPositionTile,
    passableMap: number[][],
  ): Promise<IPositionTile[] | null>;

  getDistance(
    locationId: string,
    from: IPositionTile,
    to: IPositionTile,
    passableMap: number[][],
  ): Promise<number>;
}
