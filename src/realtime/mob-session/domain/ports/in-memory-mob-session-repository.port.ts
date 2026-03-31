import type { MobSession } from '../entities/mob-session.entity';

export interface MobSessionRepositoryPort {
  findByMobId(mobId: string): MobSession | null;
  save(mobSession: MobSession): void;
  remove(id: string): void;
}
