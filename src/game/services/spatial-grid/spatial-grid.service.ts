import { Injectable } from '@nestjs/common';
import { decodeGridKey } from './lib/decode-grid-key.lib';
import { DecodedGridKey } from './types/decoed-grid-key.type';
import { QueryRadiusResult } from './types/query-radius-result.type';

@Injectable()
export class SpatialGridService<
  T extends {
    id: string;
    locationId: string;
    x: number;
    y: number;
  },
> {
  private readonly tileSize: number = 32;
  private cells: Map<string, Set<string>>;

  constructor() {
    this.cells = new Map();
  }

  private getCellKey(locationId: string, x: number, y: number): string {
    const { x: cx, y: cy } = this.getTileByPosition(x, y);
    return `${locationId}_${cx}_${cy}`;
  }

  add(entity: T) {
    const key = this.getCellKey(entity.locationId, entity.x, entity.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key)!.add(entity.id);
  }

  remove(entity: T) {
    const key = this.getCellKey(entity.locationId, entity.x, entity.y);
    this.cells.get(key)?.delete(entity.id);
  }

  update(entity: T, oldLocationId: string, oldX: number, oldY: number) {
    const oldKey = this.getCellKey(oldLocationId, oldX, oldY);
    const newKey = this.getCellKey(entity.locationId, entity.x, entity.y);
    if (oldKey !== newKey) {
      this.remove({ ...entity, x: oldX, y: oldY });
      this.add(entity);
    }
  }

  queryRadius(
    locationId: string,
    x: number,
    y: number,
    radius: number,
  ): QueryRadiusResult {
    const { x: centerX, y: centerY } = this.getTileByPosition(x, y);

    const minX = centerX - radius;
    const maxX = centerX + radius;
    const minY = centerY - radius;
    const maxY = centerY + radius;

    const enemiesIds: string[] = [];
    const affectedCells: DecodedGridKey[] = [];
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const key = `${locationId}_${cx}_${cy}`;
        const bucket = this.cells.get(key);
        if (!bucket) continue;
        affectedCells.push(decodeGridKey(key));
        bucket.forEach((eId) => enemiesIds.push(eId));
      }
    }
    return {
      enemiesIds,
      affectedCells,
    };
  }

  public getTileByPosition = (pixelX: number, pixelY: number) => {
    const x = Math.floor(pixelX / this.tileSize);
    const y = Math.floor(pixelY / this.tileSize);
    return { x, y };
  };
}
