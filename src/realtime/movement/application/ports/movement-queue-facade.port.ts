import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IMovementQueue } from '../../domain/types/movement-queue.type';

export interface MovementQueueFacadePort {
  set(entityRef: IEntityRef, movementQueue: IMovementQueue): void;
  remove(entityRef: IEntityRef): void;
}
