import { EntityType } from 'src/game/types/entity/entity-type.type';
import { DecodedEntityKey } from 'src/game/types/entity/keys/decoded-entity-key.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';

export function decodeEntityKey<T extends EntityType>(
  key: EntityKey<T>,
): DecodedEntityKey {
  const values = key.split('_') as [T, string];
  return {
    type: values[0],
    id: values[1],
  };
}
