import { Injectable } from '@nestjs/common';
import { EntityMovementQueue } from '../../types/movement-queue.type';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';
import { PlayerStateService } from '../../../player-state/player-state.service';
import { isCharacterMovementQueue } from './lib/guards/has-user-id.lib';

@Injectable()
export class MovementQueueService {
  constructor(private readonly playerStateService: PlayerStateService) {}

  private readonly movementQueues = new Map<EntityKey, EntityMovementQueue>();

  public set(entityRef: EntityRef, steps: PositionDto[]) {
    const entityKey = generateEntityKey(entityRef);
    const queue: EntityMovementQueue = { steps };
    if (isCharacterMovementQueue(entityRef, queue)) {
      const playerState = this.playerStateService.getCharacterState(
        entityRef.id,
      );
      if (!playerState) return;
      queue.userId = playerState.userId;
    }
    return this.movementQueues.set(entityKey, queue);
  }
}
