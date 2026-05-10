import type { ItemInstance } from 'src/modules/item/domain/types/item-instance.type';

export class FindItemInstancesByIdsQuery {
  constructor(public readonly ids: ItemInstance['id'][]) {}
}
