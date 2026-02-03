import { EntityRef } from 'src/game/types/entity/entity-ref.type';

export function isSameReference(a: EntityRef, b: EntityRef): boolean {
  return a.type === b.type && a.id === b.id;
}
