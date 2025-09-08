import { TiledMap } from 'src/common/types/tiled-map.type';
import { Teleport } from '../types/teleport.type';
import { isObjectsLayer } from 'src/seed/guards/is-objects-layer';
import { TeleportProperties } from '../types/teleportProperties.type';
import { isValidTeleportProperties } from './is-valid-teleport-properties.lib';

export const buildTeleportsMap = (map: TiledMap) => {
  const teleportsMap: Record<string, Teleport> = {};
  map.layers.forEach((layer) => {
    if (!isObjectsLayer(layer) || layer.name !== 'Teleports') return;
    layer.objects.forEach((o) => {
      const teleportProps = o.properties?.reduce<TeleportProperties>(
        (acc, property) => {
          if (property.name === 'targetMap') {
            acc[property.name] = property.value as string;
          }
          if (property.name === 'targetX') {
            acc[property.name] = property.value as number;
          }
          if (property.name === 'targetY') {
            acc[property.name] = property.value as number;
          }
          return acc;
        },
        {},
      );

      if (!teleportProps) return;

      if (isValidTeleportProperties(teleportProps)) {
        const teleport: Teleport = {
          id: o.id,
          name: o.name,
          width: o.width,
          height: o.height,
          targetMap: teleportProps.targetMap,
          targetX: teleportProps.targetX,
          targetY: teleportProps.targetY,
          x: o.x,
          y: o.y,
        };

        teleportsMap[teleport.name] = teleport;
      }
    });
  });

  return teleportsMap;
};
