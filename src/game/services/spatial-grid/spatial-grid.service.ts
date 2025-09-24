import { Injectable } from '@nestjs/common';
import { decodeGridKey } from './lib/decode-grid-key.lib';
import { DecodedGridKey } from './types/decoed-grid-key.type';
import { QueryRadiusResult } from './types/query-radius-result.type';
import { getTileByPosition } from 'src/game/lib/get-tile-by-position.lib';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { DecodedEntityKey } from '../../types/entity/keys/decoded-entity-key.type';

@Injectable()
export class SpatialGridService<
  T extends {
    id: string;
    locationId: string;
    x: number;
    y: number;
    type: EntityType;
  },
> {
  private readonly tileSize: number = 32;
  private cells: Map<string, Set<string>>;

  constructor() {
    this.cells = new Map();
  }

  private getCellKey(locationId: string, x: number, y: number): string {
    const { x: cx, y: cy } = getTileByPosition(x, y, this.tileSize);
    return `${locationId}_${cx}_${cy}`;
  }

  private generateEntityKey(entity: T): string {
    return `${entity.type}_${entity.id}`;
  }

  private decodeEntityKey(key: string): DecodedEntityKey {
    const values = key.split('_');
    return {
      type: values[0] as EntityType,
      id: values[1],
    };
  }

  add(entity: T) {
    const key = this.getCellKey(entity.locationId, entity.x, entity.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key)!.add(this.generateEntityKey(entity));
  }

  remove(entity: T) {
    const key = this.getCellKey(entity.locationId, entity.x, entity.y);
    this.cells.get(key)?.delete(this.generateEntityKey(entity));
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
    const { x: centerX, y: centerY } = getTileByPosition(x, y, this.tileSize);

    const minX = centerX - radius;
    const maxX = centerX + radius;
    const minY = centerY - radius;
    const maxY = centerY + radius;

    const entities: DecodedEntityKey[] = [];
    const affectedCells: DecodedGridKey[] = [];
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const key = `${locationId}_${cx}_${cy}`;
        const bucket = this.cells.get(key);
        if (!bucket) continue;
        affectedCells.push(decodeGridKey(key));
        bucket.forEach((stringValues) => {
          const decoded = this.decodeEntityKey(stringValues);
          return entities.push(decoded);
        });
      }
    }
    return {
      entities,
      affectedCells,
    };
  }
}
