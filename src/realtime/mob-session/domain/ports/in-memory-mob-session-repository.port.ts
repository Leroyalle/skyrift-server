import type { MobSession } from '../entities/mob-session.entity';

export interface MobSessionRepositoryPort {
  findById(mobId: string): MobSession | null;
  save(mobSession: MobSession): void;
  remove(id: string): void;
  getByLocationId(locationId: string): MobSession[];
  getIterable(): Iterable<MobSession>;
}
