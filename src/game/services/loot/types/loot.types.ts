import { TItem } from 'src/common/types/item.type';

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

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

type ClientItem = DistributiveOmit<TItem, 'bag' | 'slot' | 'texture'>;

export interface LootDrop {
  item: ClientItem;
  amount: number;
}
