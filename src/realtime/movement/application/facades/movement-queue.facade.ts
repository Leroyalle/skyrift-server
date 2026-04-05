import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryMovementQueueRepositoryPort } from '../../domain/ports/in-memory-movement-queue-repository.port';
import type { IMovementQueue } from '../../domain/types/movement-queue.type';
import type { MovementQueueFacadePort } from '../ports/movement-queue-facade.port';
import { IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY } from '../ports/tokens';

@Injectable()
export class MovementQueueFacade implements MovementQueueFacadePort {
  constructor(
    @Inject(IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY)
    private readonly movementQueueRepository: InMemoryMovementQueueRepositoryPort,
  ) {}

  public set(entityRef: IEntityRef, movementQueue: IMovementQueue) {
    this.movementQueueRepository.set(entityRef, movementQueue);
  }
}
