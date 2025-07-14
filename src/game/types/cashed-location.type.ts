import { Location } from 'src/location/entities/location.entity';

export type CachedLocation = Location & { passableMap: number[][] };
