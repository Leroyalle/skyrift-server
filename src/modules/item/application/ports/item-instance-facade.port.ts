import type { ItemInstance } from '../../domain/types/item-instance.type';

export interface ItemInstanceFacadePort {
  findByIds(id: ItemInstance['id'][]): Promise<ItemInstance[]>;

  findByContainerRef(
    containerId: ItemInstance['containerId'],
    containerType: ItemInstance['containerType'],
  ): Promise<ItemInstance[]>;
  delete(id: ItemInstance['id']): Promise<void>;
  create(item: Omit<ItemInstance, 'id'>): Promise<ItemInstance>;
}
