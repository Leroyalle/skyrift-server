import { PATH_FINDING_SERVICE, type PathFindingServicePort } from 'src/realtime/path-finding';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryMovementQueueRepositoryPort } from '../../domain/ports/in-memory-movement-queue-repository.port';
import type {
  PlanMovementUseCasePayload,
  PlanMovementUseCasePort,
} from '../ports/plan-movement-use-case.port';
import { IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY } from '../ports/tokens';

@Injectable()
export class PlanMovementUseCase implements PlanMovementUseCasePort {
  constructor(
    @Inject(IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY)
    private readonly movementQueueRepository: InMemoryMovementQueueRepositoryPort,
    @Inject(PATH_FINDING_SERVICE)
    private readonly pathFindingService: PathFindingServicePort,
  ) {}

  public async execute(input: PlanMovementUseCasePayload) {
    const isPermissible =
      input.location.passableMap?.[input.targetTile.y]?.[input.targetTile.x] === 1;

    if (!isPermissible) return;

    const steps = await this.pathFindingService.getPath(
      input.location.id,
      {
        x: Math.floor(input.entity.position.x / input.location.tileWidth),
        y: Math.floor(input.entity.position.y / input.location.tileHeight),
      },
      { x: input.targetTile.x, y: input.targetTile.y },
      input.location.passableMap,
    );

    if (!steps) return;

    this.movementQueueRepository.set({ id: input.entity.characterId, type: 'player' }, { steps });
  }
}
