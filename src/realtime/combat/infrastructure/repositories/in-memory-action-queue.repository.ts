import { generateEntityKey } from 'src/realtime/shared/lib/helpers/generate-entity-key.helper';
import type { IEntityKey, IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';

import type { ActionQueueRepositoryPort } from '../../domain/ports/action-queue-repository.port';
import type { PendingAction } from '../../domain/types/action-queue.type';

@Injectable()
export class InMemoryActionQueueRepository implements ActionQueueRepositoryPort {
  private readonly pendingActionsQueue: Map<IEntityKey, PendingAction[]> = new Map();

  public get(entityRef: IEntityRef): PendingAction[] {
    const key = generateEntityKey(entityRef);
    return this.getOrCreateActionQueue(key);
  }

  public shift(entityRef: IEntityRef): PendingAction | undefined {
    const key = generateEntityKey(entityRef);
    const queue = this.getOrCreateActionQueue(key);
    return queue.shift();
  }

  public set(action: PendingAction): void {
    const key = generateEntityKey(action.attackerRef);
    const queue = this.getOrCreateActionQueue(key);
    queue.push(action);
  }

  public clearAll(): void {
    this.pendingActionsQueue.clear();
  }

  public clear(entityRef: IEntityRef): void {
    const key = generateEntityKey(entityRef);
    this.pendingActionsQueue.delete(key);
  }

  private getOrCreateActionQueue(key: IEntityKey): PendingAction[] {
    let queue = this.pendingActionsQueue.get(key);
    if (!queue) {
      queue = [];
      this.pendingActionsQueue.set(key, queue);
    }
    return queue;
  }

  public getAllIterable(): PendingAction[][] {
    return Array.from(this.pendingActionsQueue.values());
  }
}
