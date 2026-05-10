import { TiledMap } from 'src/common/types/tiled-map.type';
import { isTileLayer } from 'src/realtime/location';

export function optimizeTilesets(map: TiledMap) {
  const usesIds = new Set<number>();
  for (const layer of map.layers) {
    if (!isTileLayer(layer)) continue;
    layer.data.forEach(gid => {
      if (gid > 0) usesIds.add(gid);
    });
  }
  map.tilesets.forEach(tileset => {
    const { firstgid } = tileset;
    tileset.tiles = tileset.tiles?.filter(tile => usesIds.has(firstgid + tile.id));
  });
  return map;
}
