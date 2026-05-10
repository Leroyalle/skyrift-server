import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IMovementQueue } from '../../domain/types/movement-queue.type';

export interface MovementQueueReaderPort {
  get(entityRef: IEntityRef): IMovementQueue | null;
}
