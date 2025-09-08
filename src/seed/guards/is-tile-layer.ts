import { TiledLayer } from 'src/common/types/tiled-map.type';

export const isTileLayer = (
  layer: TiledLayer,
): layer is TiledLayer & { data: number[]; width: number; height: number } => {
  return layer.type === 'tilelayer';
};
