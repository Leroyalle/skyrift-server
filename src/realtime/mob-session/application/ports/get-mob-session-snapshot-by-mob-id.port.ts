import type { MobSessionSnapshot } from '../../domain/types/mob-session.type';

export interface GetMobSessionSnapshotByMobIdPort {
  execute(mobSessionId: string): MobSessionSnapshot | null;
}
