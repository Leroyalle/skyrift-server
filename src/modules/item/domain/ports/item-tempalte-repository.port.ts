import type { ItemTemplate } from '../types/item-template.type';

export interface ItemTemplateRepositoryPort {
  find(id: ItemTemplate['id']): Promise<ItemTemplate | null>;
  findByIds(ids: ItemTemplate['id'][]): Promise<ItemTemplate[]>;
  findAll(): Promise<ItemTemplate[]>;
  save(itemTemplate: ItemTemplate): Promise<void>;
  delete(itemTemplate: ItemTemplate): Promise<void>;
}
