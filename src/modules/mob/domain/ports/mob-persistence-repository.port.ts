import type { Mob } from '../entities/mob.entity';

export interface MobPersistenceRepositoryPort {
  save(mob: Mob): Promise<void>;
  findById(id: string): Promise<Mob | null>;
  remove(id: string): Promise<void>;
  update(mob: Mob): Promise<void>;
}
