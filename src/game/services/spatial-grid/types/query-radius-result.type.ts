import { DecodedEntityKey } from './decoed-entity-key.type';
import { DecodedGridKey } from './decoed-grid-key.type';

export type QueryRadiusResult = {
  entities: DecodedEntityKey[];
  affectedCells: DecodedGridKey[];
};
