import type { ItemContainerType } from 'src/modules/item/domain/types/item-instance.type';

export class FindItemInstancesByContainerRefQuery {
  constructor(
    public readonly props: {
      containerType: ItemContainerType;
      containerId: string;
    },
  ) {}
}
