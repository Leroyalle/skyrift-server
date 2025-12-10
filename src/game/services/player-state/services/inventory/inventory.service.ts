import { Injectable } from '@nestjs/common';
import { Bag } from 'src/character/bag/entities/bag.entity';
import { TItem } from 'src/common/types/item.type';

@Injectable()
export class InventoryService {
  // constructor(private readonly playerStateService: PlayerStateService) {}

  public add(bag: Bag, item: TItem): void {
    bag.items.push(item);
  }
}
