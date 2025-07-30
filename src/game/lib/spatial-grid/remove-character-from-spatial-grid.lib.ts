import { generateSpatialGridKey } from './generate-spatial-grid-key.lib';

export function removeCharacterFromSpatialGrid(
  spatialGrid: Map<string, Set<string>>,
  characterId: string,
  locationId: string,
  x: number,
  y: number,
) {
  const key = generateSpatialGridKey(locationId, x, y);
  const set = spatialGrid.get(key);
  if (!set) return;

  set.delete(characterId);
  if (set.size === 0) {
    spatialGrid.delete(key);
  }
}
