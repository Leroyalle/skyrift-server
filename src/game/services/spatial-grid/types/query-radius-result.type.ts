import { DecodedEntityKey } from '../../../types/entity/decoded-entity-key.type';
import { DecodedGridKey } from './decoed-grid-key.type';

export type QueryRadiusResult = {
  entities: DecodedEntityKey[];
  affectedCells: DecodedGridKey[];
};
