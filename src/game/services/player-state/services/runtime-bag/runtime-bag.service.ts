import { Injectable } from '@nestjs/common';
import { Item } from 'src/item/entities/item.entity';
import { Bag } from 'src/character/bag/entities/bag.entity';

@Injectable()
export class RuntimeBagService {
  // constructor(private readonly playerStateService: PlayerStateService) {}

  public add(bag: Bag, item: Item) {
    bag.items.push(item);
  }
}
