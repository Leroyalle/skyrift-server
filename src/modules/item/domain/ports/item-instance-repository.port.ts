import type { ItemInstance } from '../types/item-instance.type';

export interface ItemInstanceRepositoryPort {
  findById(id: ItemInstance['id']): Promise<ItemInstance | null>;
  findByIds(ids: ItemInstance['id'][]): Promise<ItemInstance[]>;
  save(itemInstance: ItemInstance): Promise<void>;
  delete(itemInstance: ItemInstance): Promise<void>;
  findByOwner(
    ownerId: ItemInstance['ownerId'],
    ownerType: ItemInstance['ownerType'],
  ): Promise<ItemInstance[]>;
  findByContainer(
    containerId: ItemInstance['containerId'],
    containerType: ItemInstance['containerType'],
  ): Promise<ItemInstance[]>;
}
