import { PATH_FINDING_SERVICE, type PathFindingServicePort } from 'src/realtime/path-finding';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';

import { Inject, Injectable } from '@nestjs/common';

import type {
  ApproachActor,
  ApproachLocation,
  ApproachTargetPoint,
  ApproachTargetServicePort,
} from '../ports/approach-target-service.port';
import type { MovementQueueFacadePort } from '../ports/movement-queue-facade.port';
import { MOVEMENT_QUEUE_FACADE_TOKEN } from '../ports/tokens';

@Injectable()
export class ApproachTargetService implements ApproachTargetServicePort {
  constructor(
    @Inject(MOVEMENT_QUEUE_FACADE_TOKEN)
    private readonly movementQueueService: MovementQueueFacadePort,
    @Inject(PATH_FINDING_SERVICE) private readonly pathFindingService: PathFindingServicePort,
  ) {}

  public async execute(payload: {
    actor: ApproachActor;
    target: ApproachTargetPoint;
    location: ApproachLocation;
  }): Promise<boolean> {
    const steps = await this.pathFindingService.getPath(
      payload.actor.position.locationId,
      {
        ...getTileByPosition(payload.actor.position.x, payload.actor.position.y),
      },
      { ...getTileByPosition(payload.target.position.x, payload.target.position.y) },
      payload.location.passableMap,
    );

    if (!steps) return false;

    if (steps.length > 1) {
      this.movementQueueService.set(payload.actor, { steps });
      return false;
    }

    return true;
  }
}
