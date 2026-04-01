import type { IEntityRef } from '../../../shared/types/entity-ref.type';

export function isSameReference(a: IEntityRef, b: IEntityRef): boolean {
  return a.type === b.type && a.id === b.id;
}
