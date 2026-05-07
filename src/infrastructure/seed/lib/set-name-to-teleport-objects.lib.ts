import { TiledMap } from 'src/common/types/tiled-map.type';
import { isObjectsLayer } from 'src/realtime/location';
import { v4 as uuidv4 } from 'uuid';

export function setNameToTeleportObjects(map: TiledMap) {
  const teleportsLayer = map.layers.find(
    layer => layer.name === 'Teleports' && layer.type === 'objectgroup',
  );
  if (!teleportsLayer) return;
  if (!isObjectsLayer(teleportsLayer)) return;
  teleportsLayer.objects.forEach(obj => {
    const uuid = uuidv4() as string;
    obj.name = uuid;
    return obj;
  });
  return map;
}
