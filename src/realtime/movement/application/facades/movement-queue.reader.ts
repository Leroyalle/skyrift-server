import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryMovementQueueRepositoryPort } from '../../domain/ports/in-memory-movement-queue-repository.port';
import type { IMovementQueue } from '../../domain/types/movement-queue.type';
import type { MovementQueueReaderPort } from '../ports/movement-queue-reader.port';
import { IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY } from '../ports/tokens';

@Injectable()
export class MovementQueueReader implements MovementQueueReaderPort {
  constructor(
    @Inject(IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY)
    private readonly movementQueueRepository: InMemoryMovementQueueRepositoryPort,
  ) {}

  public get(entityRef: IEntityRef): IMovementQueue | null {
    return this.movementQueueRepository.get(entityRef);
  }
}
