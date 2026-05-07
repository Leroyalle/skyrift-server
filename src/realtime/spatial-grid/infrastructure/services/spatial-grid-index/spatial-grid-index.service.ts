import { decodeEntityKey } from 'src/realtime/shared/lib/helpers/decode-entity-key.helper';
import { generateEntityKey } from 'src/realtime/shared/lib/helpers/generate-entity-key.helper';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';
import type {
  IEntityKey,
  IEntityRef,
  IEntityType,
} from 'src/realtime/shared/types/entity-ref.type';
import type {
  DecodedGridKey,
  QueryRadiusResult,
  SpatialGridIndexPort,
} from 'src/realtime/spatial-grid/application/ports/spatial-grid-index.port';

import { Injectable } from '@nestjs/common';

import { decodeGridKey } from './decode-grid-key.lib';

@Injectable()
export class SpatialGridIndexService<
  T extends {
    id: string;
    locationId: string;
    x: number;
    y: number;
    type: IEntityType;
  },
> implements SpatialGridIndexPort<T> {
  private readonly tileSize: number = 32;
  private cells: Map<string, Set<IEntityKey>>;

  constructor() {
    this.cells = new Map();
  }

  private getCellKey(locationId: string, x: number, y: number): string {
    const { x: cx, y: cy } = getTileByPosition(x, y, this.tileSize);
    return `${locationId}_${cx}_${cy}`;
  }

  public add(entity: T) {
    const key = this.getCellKey(entity.locationId, entity.x, entity.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key)!.add(generateEntityKey(entity));
  }

  public remove(entity: T) {
    const key = this.getCellKey(entity.locationId, entity.x, entity.y);
    this.cells.get(key)?.delete(generateEntityKey(entity));
  }

  public update(entity: T, oldLocationId: string, oldX: number, oldY: number) {
    const oldKey = this.getCellKey(oldLocationId, oldX, oldY);
    const newKey = this.getCellKey(entity.locationId, entity.x, entity.y);
    if (oldKey !== newKey) {
      this.remove({ ...entity, x: oldX, y: oldY });
      this.add(entity);
    }
  }

  public queryRadius(
    locationId: string,
    x: number,
    y: number,
    radius: number,
    entityType: IEntityType | null = null,
  ): QueryRadiusResult {
    const { x: centerX, y: centerY } = getTileByPosition(x, y, this.tileSize);

    const minX = centerX - radius;
    const maxX = centerX + radius;
    const minY = centerY - radius;
    const maxY = centerY + radius;

    const entities: IEntityRef[] = [];
    const affectedCells: DecodedGridKey[] = [];
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const key = `${locationId}_${cx}_${cy}`;
        const bucket = this.cells.get(key);
        affectedCells.push(decodeGridKey(key));
        if (bucket) {
          bucket.forEach(stringValues => {
            const decoded = decodeEntityKey(stringValues);
            if (entityType && decoded.type !== entityType) return;
            entities.push(decoded);
          });
        }
      }
    }
    return {
      entities,
      affectedCells,
    };
  }
}
