import type { IEntityKey, IEntityRef, IEntityType } from '../../types/entity-ref.type';

export function decodeEntityKey<T extends IEntityType>(key: IEntityKey<T>): IEntityRef {
  const values = key.split('_') as [T, string];
  return {
    type: values[0],
    id: values[1],
  };
}
