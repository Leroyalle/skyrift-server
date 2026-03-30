import type { MobSession } from '../entities/mob-session.entity';

export interface InMemoryMobSessionRepositoryPort {
  findById(id: string): MobSession | null;
  save(mobSession: MobSession): void;
  remove(id: string): void;
}
