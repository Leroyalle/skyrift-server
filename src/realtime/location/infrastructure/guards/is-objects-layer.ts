import { TiledLayer, TiledObject } from 'src/common/types/tiled-map.type';

export const isObjectsLayer = (
  layer: TiledLayer,
): layer is TiledLayer & {
  objects: TiledObject[];
  draworder: string;
  rotation: number;
} => {
  return layer.type === 'objectgroup';
};
