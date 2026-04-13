import type { ItemTemplate } from '../../domain/types/item-template.type';

export interface ItemTemplateFacadePort {
  findByIds(ids: string[]): Promise<ItemTemplate[]>;
  findById(id: string): Promise<ItemTemplate | null>;
}
