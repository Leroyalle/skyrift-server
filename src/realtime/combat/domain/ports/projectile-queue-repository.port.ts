import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IProjectile } from '../types/projectile-queue.type';

export interface ProjectileQueueRepositoryPort {
  getAllByRef(entityRef: IEntityRef): IProjectile[];
  get(entityRef: IEntityRef, startedAt: number): IProjectile | null;
  setArray(entityRef: IEntityRef, projectiles: IProjectile[]): void;
  set(entityRef: IEntityRef, projectile: IProjectile): void;
  clear(entityRef: IEntityRef): void;
  remove(entityRef: IEntityRef, startedAt: number): void;
  getAll(): Iterable<{ attackerRef: IEntityRef; projectile: IProjectile }>;
}
