import type { ItemTemplate } from '../types/item-tamplate.type';

export interface ItemTemplateRepositoryPort {
  find(id: ItemTemplate['id']): Promise<ItemTemplate | null>;
  findAll(): Promise<ItemTemplate[]>;
  save(itemTemplate: ItemTemplate): Promise<void>;
  delete(itemTemplate: ItemTemplate): Promise<void>;
}
