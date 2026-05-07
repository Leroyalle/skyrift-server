import type { DecodedGridKey } from 'src/realtime/spatial-grid/application/ports/spatial-grid-index.port';

export const decodeGridKey = (key: string): DecodedGridKey => {
  const [locationId, x, y] = key.split('_');
  return { locationId, x: Number(x), y: Number(y) };
};
