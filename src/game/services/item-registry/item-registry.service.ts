import { TItem } from 'src/common/types/item.type';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ItemRegistryService {
  private readonly items = new Map<string, TItem>();

  get itemsArray(): TItem[] {
    return Array.from(this.items.values());
  }

  public add(item: TItem): void {
    this.items.set(item.id, item);
  }

  public remove(item: TItem): void {
    this.items.delete(item.id);
  }

  public getAll(): TItem[] {
    return this.itemsArray;
  }

  public getById(itemId: string): TItem | undefined {
    return this.items.get(itemId);
  }

  public getByType(type: TItem['itemType']): TItem[] {
    return this.itemsArray.filter(item => item.itemType === type);
  }

  public getByBagId(bagId: string): TItem[] {
    return this.itemsArray.filter(item => item.bag?.id === bagId);
  }
}
