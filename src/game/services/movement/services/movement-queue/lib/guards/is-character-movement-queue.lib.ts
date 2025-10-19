import {
  CharacterMovementQueue,
  EntityMovementQueue,
} from 'src/game/services/movement/types/movement-queue.type';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';

export function isCharacterMovementQueue(
  entityRef: EntityRef,
  queue: EntityMovementQueue,
): queue is CharacterMovementQueue {
  return entityRef.type === 'player';
}
