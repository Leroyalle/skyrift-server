export class SpatialGrid<
  T extends {
    id: string;
    locationId: string;
    x: number;
    y: number;
  },
> {
  private readonly tileSize: number;
  private cells: Map<string, Set<string>>;

  constructor(tileSize: number) {
    this.tileSize = tileSize;
    this.cells = new Map();
  }

  private getCellKey(locationId: string, x: number, y: number): string {
    const cx = Math.floor(x / this.tileSize);
    const cy = Math.floor(y / this.tileSize);
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
  ): string[] {
    const minX = Math.floor((x - radius) / this.tileSize);
    const maxX = Math.floor((x + radius) / this.tileSize);
    const minY = Math.floor((y - radius) / this.tileSize);
    const maxY = Math.floor((y + radius) / this.tileSize);

    const results: string[] = [];
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const key = `${locationId}_${cx}_${cy}`;
        const bucket = this.cells.get(key);
        if (!bucket) continue;
        bucket.forEach((eId) => results.push(eId));
      }
    }
    return results;
  }
}
