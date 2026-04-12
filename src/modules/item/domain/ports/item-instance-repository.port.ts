import type { ItemInstance } from '../types/item-instance.type';

export interface ItemInstanceRepositoryPort {
  findById(id: string): Promise<ItemInstance | null>;
  findByTemplateId(templateId: string): Promise<ItemInstance[]>;
  save(itemInstance: ItemInstance): Promise<void>;
  delete(itemInstance: ItemInstance): Promise<void>;
}
