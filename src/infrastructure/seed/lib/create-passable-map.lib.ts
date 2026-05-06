import { Property, TiledMap } from 'src/common/types/tiled-map.type';
import { isTileLayer } from 'src/realtime/location';

export function createPassableMap(map: TiledMap) {
  const tilesMap = new Map<number, Property[]>();
  map.tilesets.forEach(tileset => {
    const { firstgid } = tileset;
    tileset.tiles?.forEach(tile => {
      tilesMap.set(firstgid + tile.id, tile.properties ?? []);
    });
  });
  const passableMap: number[][] = Array.from({ length: map.height }, () =>
    Array(map.width).fill(1),
  );
  for (const layer of map.layers) {
    if (!isTileLayer(layer)) continue;
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const tileIndex = y * layer.width + x;
        const tileId = layer.data[tileIndex];
        if (!tileId) continue;
        const props = tilesMap.get(tileId);
        if (!props) continue;
        const passableProperty = props.find(prop => prop.name === 'passable');
        if (passableProperty && passableProperty.value === false) {
          passableMap[y][x] = 0;
        }
      }
    }
  }
  return passableMap;
}
