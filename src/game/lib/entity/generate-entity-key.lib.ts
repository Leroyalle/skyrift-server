import { DecodedEntityKey } from 'src/game/types/entity/decoded-entity-key.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { EntityKey } from 'src/game/types/entity/entity-key.type';

export function generateEntityKey<T extends { type: EntityType; id: string }>(
  entity: T,
): EntityKey<T['type']> {
  return `${entity.type}_${entity.id}`;
}

export function decodeEntityKey<T extends EntityType>(
  key: EntityKey<T>,
): DecodedEntityKey {
  const values = key.split('_') as [T, string];
  return {
    type: values[0],
    id: values[1],
  };
}
