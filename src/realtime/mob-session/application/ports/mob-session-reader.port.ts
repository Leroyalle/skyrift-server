import type { MobSessionSnapshot } from '../../domain/types/mob-session.type';

export interface MobSessionReaderPort {
  getByLocationId(locationId: string): MobSessionSnapshot[];
  getIterable(): Iterable<MobSessionSnapshot>;
}
