import { EntityRef } from '../../../types/entity/entity-ref.type';
import { DecodedGridKey } from './decoed-grid-key.type';

export type QueryRadiusResult = {
  entities: EntityRef[];
  affectedCells: DecodedGridKey[];
};
