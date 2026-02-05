import { BaseItem } from 'src/item/entities/item.entity';

export enum LootRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface LootItem {
  itemId: string;

  chance: number;
  rarity: LootRarity;
  minAmount?: number;
  maxAmount?: number;
  durability?: number;
}

export interface LootDrop {
  item: BaseItem;
  amount: number;
}
