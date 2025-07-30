import { generateSpatialGridKey } from './generate-spatial-grid-key.lib';

export function addCharacterToSpatialGrid(
  spatialGrid: Map<string, Set<string>>,
  characterId: string,
  locationId: string,
  x: number,
  y: number,
) {
  const key = generateSpatialGridKey(locationId, x, y);
  const set = spatialGrid.get(key) ?? new Set<string>();
  set.add(characterId);
  spatialGrid.set(key, set);
}
