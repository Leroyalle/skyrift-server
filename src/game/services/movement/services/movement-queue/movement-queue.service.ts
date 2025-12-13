import { Injectable } from '@nestjs/common';
import { EntityMovementQueue } from '../../types/movement-queue.type';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';
import { PlayerStateService } from '../../../player-state/player-state.service';
import { isCharacterMovementQueue } from './lib/guards/is-character-movement-queue.lib';

@Injectable()
export class MovementQueueService {
  constructor(private readonly playerStateService: PlayerStateService) {}

  private readonly movementQueues = new Map<EntityKey, EntityMovementQueue>();

  public set(entityRef: EntityRef, steps: PositionDto[]): void {
    const entityKey = generateEntityKey(entityRef);
    const queue: EntityMovementQueue = { steps };
    if (isCharacterMovementQueue(entityRef, queue)) {
      const playerState = this.playerStateService.getCharacterState(entityRef.id);
      if (!playerState) return;
      queue.userId = playerState.userId;
    }
    this.movementQueues.set(entityKey, queue);
  }

  public delete(entityRef: EntityRef): boolean {
    return this.movementQueues.delete(generateEntityKey(entityRef));
  }

  public get(entityRef: EntityRef): EntityMovementQueue | undefined {
    return this.movementQueues.get(generateEntityKey(entityRef));
  }

  public get getIterableMovementQueues() {
    return Array.from(this.movementQueues.entries());
  }
}
