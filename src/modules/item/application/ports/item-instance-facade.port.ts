import type { ItemInstance } from '../../domain/types/item-instance.type';

export interface ItemInstanceFacadePort {
  findByIds(id: ItemInstance['id'][]): Promise<ItemInstance[]>;
  findByOwnerRef(
    ownerId: ItemInstance['ownerId'],
    ownerType: ItemInstance['ownerType'],
  ): Promise<ItemInstance[]>;
  findByContainerRef(
    containerId: ItemInstance['containerId'],
    containerType: ItemInstance['containerType'],
  ): Promise<ItemInstance[]>;
}
