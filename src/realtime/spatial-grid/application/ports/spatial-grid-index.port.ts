import type { IEntityRef, IEntityType } from 'src/realtime/shared/types/entity-ref.type';

interface SpatialGridEntity {
  id: string;
  locationId: string;
  x: number;
  y: number;
  type: IEntityType;
}

export interface SpatialGridIndexPort<T extends SpatialGridEntity = SpatialGridEntity> {
  add(entity: T): void;
  remove(entity: T): void;
  update(entity: T, oldLocationId: string, oldX: number, oldY: number): void;
  queryRadius(
    locationId: string,
    x: number,
    y: number,
    radius: number,
    entityType: IEntityType | null,
  ): QueryRadiusResult;
}

export type QueryRadiusResult = {
  entities: IEntityRef[];
  affectedCells: DecodedGridKey[];
};

export type DecodedGridKey = {
  locationId: string;
  x: number;
  y: number;
};
