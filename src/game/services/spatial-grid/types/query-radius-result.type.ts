import { DecodedGridKey } from './decoed-grid-key.type';

export type QueryRadiusResult = {
  enemiesIds: string[];
  affectedCells: DecodedGridKey[];
};
