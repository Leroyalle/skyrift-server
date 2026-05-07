import type { TiledMap } from 'src/common/types/tiled-map.type';

import type { Teleport } from './teleport.type';

export interface ILocation {
  id: string;
  passableMap: number[][];
  name: string;
  size: {
    tileWidth: number;
    tileHeight: number;
    width: number;
    height: number;
  };
  filename: string;
  tiledMap: TiledMap;
  teleportsMap: Record<string, Teleport>;
}
