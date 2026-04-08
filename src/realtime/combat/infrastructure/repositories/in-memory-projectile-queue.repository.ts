import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';

import type { ProjectileQueueRepositoryPort } from '../../domain/ports/projectile-queue-repository.port';
import type { IProjectile } from '../../domain/types/projectile-queue.type';

@Injectable()
export class ProjectileQueueRepository implements ProjectileQueueRepositoryPort {
  private readonly projectileQueue: Map<string, Map<number, IProjectile>> = new Map();

  public getAllByRef(entityRef: IEntityRef): IProjectile[] {
    const projectiles = this.projectileQueue.get(entityRef.id);
    return projectiles ? Array.from(projectiles.values()) : [];
  }

  public get(entityRef: IEntityRef, startedAt: number): IProjectile | null {
    const projectiles = this.projectileQueue.get(entityRef.id);
    return projectiles?.get(startedAt) ?? null;
  }

  public clear(entityRef: IEntityRef): void {
    this.projectileQueue.delete(entityRef.id);
  }

  public set(entityRef: IEntityRef, projectile: IProjectile): void {
    const projectiles = this.projectileQueue.get(entityRef.id);
    if (projectiles) {
      projectiles.set(projectile.startedAt, projectile);
    }
  }

  public setArray(entityRef: IEntityRef, projectiles: IProjectile[]): void {
    this.projectileQueue.set(entityRef.id, new Map(projectiles.map(p => [p.startedAt, p])));
  }

  public remove(entityRef: IEntityRef): void {
    this.projectileQueue.delete(entityRef.id);
  }
}
