import { TItem } from 'src/common/types/item.type';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ItemRegistryService {
  private readonly items = new Map<string, TItem>();

  constructor() {
    console.log('[ItemRegistry] ctor instance =', Math.random().toString(36).slice(2));
  }

  get itemsArray(): TItem[] {
    return Array.from(this.items.values());
  }

  public add(item: TItem): void {
    console.log('[ItemRegistry] add', item.id, item.name, 'size before =', this.items.size);
    this.items.set(item.id, item);
    console.log('[ItemRegistry] size after =', this.items.size);
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
