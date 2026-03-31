import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IMovementQueue } from '../types/movement-queue.type';

export interface InMemoryMovementQueueRepositoryPort {
  add(ref: IEntityRef, movementQueue: IMovementQueue): void;
  get(entityRef: IEntityRef): IMovementQueue | null;
  remove(entityRef: IEntityRef): void;
}
