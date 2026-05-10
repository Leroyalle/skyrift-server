import type { IEntityKey, IEntityType } from '../../types/entity-ref.type';

export function generateEntityKey<T extends { type: IEntityType; id: string }>(
  entity: T,
): IEntityKey<T['type']> {
  return `${entity.type}_${entity.id}`;
}
