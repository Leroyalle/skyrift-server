import type { IMob } from '../../domain/types/mob.type';

export interface MobReaderPort {
  getById(id: string): Promise<IMob | null>;
  getByLocationId(locationId: string): Promise<IMob[]>;
  getAll(): Promise<IMob[]>;
}
