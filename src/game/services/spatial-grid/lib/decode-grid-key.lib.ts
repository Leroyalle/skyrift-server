import { DecodedGridKey } from '../types/decoed-grid-key.type';

export const decodeGridKey = (key: string): DecodedGridKey => {
  const [locationId, x, y] = key.split('_');
  return { locationId, x: Number(x), y: Number(y) };
};
