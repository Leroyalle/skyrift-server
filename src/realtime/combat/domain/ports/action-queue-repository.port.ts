import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { PendingAction } from '../types/action-queue.type';

export interface ActionQueueRepositoryPort {
  set(action: PendingAction): void;
  get(entityRef: IEntityRef): PendingAction[];
  clear(): void;
  shift(entityRef: IEntityRef): void;
}
