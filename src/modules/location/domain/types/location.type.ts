import type { TiledMap } from 'src/common/types/tiled-map.type';

export interface ILocation {
  id: string;
  name: string;
  filename: string;
  tiledMap: TiledMap;
  passableMap: number[][];
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
}
