import { EntityType } from 'src/game/types/entity/entity-type.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';

export function generateEntityKey<T extends { type: EntityType; id: string }>(
  entity: T,
): EntityKey<T['type']> {
  return `${entity.type}_${entity.id}`;
}
