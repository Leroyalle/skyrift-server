import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import type { IEntityKey, IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';

import type { InMemoryMovementQueueRepositoryPort } from '../../domain/ports/in-memory-movement-queue-repository.port';
import type { IMovementQueue } from '../../domain/types/movement-queue.type';

@Injectable()
export class InMemoryMovementQueueRepository implements InMemoryMovementQueueRepositoryPort {
  private readonly queues: Map<IEntityKey, IMovementQueue> = new Map();

  public add(entityRef: IEntityRef, steps: IMovementQueue): void {
    this.queues.set(generateEntityKey(entityRef), steps);
  }

  public remove(entityRef: IEntityRef): void {
    this.queues.delete(generateEntityKey(entityRef));
  }

  public get(entityRef: IEntityRef): IMovementQueue | null {
    return this.queues.get(generateEntityKey(entityRef)) ?? null;
  }
}
