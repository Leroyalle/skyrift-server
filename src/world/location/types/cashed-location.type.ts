import { Location } from 'src/world/location/entities/location.entity';

import { Teleport } from './teleport.type';

export type CachedLocation = Location & {
  teleportsMap: Record<string, Teleport>;
};
