import type { ItemInstance } from '../types/item-instance.type';

export interface ItemInstanceRepositoryPort {
  findById(id: ItemInstance['id']): Promise<ItemInstance | null>;
  findByIds(ids: ItemInstance['id'][]): Promise<ItemInstance[]>;
  save(itemInstance: ItemInstance): Promise<ItemInstance>;
  delete(id: ItemInstance['id']): Promise<void>;
  findByContainer(
    containerId: ItemInstance['containerId'],
    containerType: ItemInstance['containerType'],
  ): Promise<ItemInstance[]>;
}
