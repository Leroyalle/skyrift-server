import { decodeEntityKey } from 'src/realtime/shared/lib/helpers/decode-entity-key.helper';
import { generateEntityKey } from 'src/realtime/shared/lib/helpers/generate-entity-key.helper';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';
import type { IEntityKey, IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';

import type { ProjectileQueueRepositoryPort } from '../../domain/ports/projectile-queue-repository.port';
import type { IProjectile } from '../../domain/types/projectile-queue.type';

@Injectable()
export class ProjectileQueueRepository implements ProjectileQueueRepositoryPort {
  private readonly projectileQueue: Map<IEntityKey, Map<number, IProjectile>> = new Map();

  public getAllByRef(entityRef: IEntityRef): IProjectile[] {
    const projectiles = this.projectileQueue.get(generateEntityKey(entityRef));
    return projectiles ? Array.from(projectiles.values()) : [];
  }

  public get(entityRef: IEntityRef, startedAt: number): IProjectile | null {
    const projectiles = this.projectileQueue.get(generateEntityKey(entityRef));
    return projectiles?.get(startedAt) ?? null;
  }

  public clear(entityRef: IEntityRef): void {
    this.projectileQueue.delete(generateEntityKey(entityRef));
  }

  public set(entityRef: IEntityRef, projectile: IProjectile): void {
    const projectiles = getOrCreate(
      this.projectileQueue,
      generateEntityKey(entityRef),
      () => new Map(),
    );
    projectiles.set(projectile.startedAt, projectile);
  }

  public setArray(entityRef: IEntityRef, projectiles: IProjectile[]): void {
    this.projectileQueue.set(
      generateEntityKey(entityRef),
      new Map(projectiles.map(p => [p.startedAt, p])),
    );
  }

  public remove(entityRef: IEntityRef): void {
    this.projectileQueue.delete(generateEntityKey(entityRef));
  }

  public *getAll(): Iterable<{ attackerRef: IEntityRef; projectile: IProjectile }> {
    for (const [entityKey, projectiles] of this.projectileQueue.entries()) {
      const attackerRef = decodeEntityKey(entityKey);

      for (const projectile of projectiles.values()) {
        yield { attackerRef, projectile };
      }
    }
  }
}
