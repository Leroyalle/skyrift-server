import { EntityType } from 'src/game/types/entity/entity-type.type';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';

export function decodeEntityKey<T extends EntityType>(
  key: EntityKey<T>,
): EntityRef {
  const values = key.split('_') as [T, string];
  return {
    type: values[0],
    id: values[1],
  };
}
