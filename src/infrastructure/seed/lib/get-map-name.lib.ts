import { TiledMap } from 'src/common/types/tiled-map.type';

export function getMapName(tiledMap: TiledMap) {
  return String(tiledMap.properties.find(property => property.name === 'name')?.value);
}
