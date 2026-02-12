import { Armor, Resource, Weapon } from 'src/item/entities/item.entity';

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

type ClientItem<T> = T extends Weapon
  ? Omit<Weapon, 'bag' | 'slot' | 'texture'>
  : T extends Armor
    ? Omit<Armor, 'bag' | 'slot' | 'texture'>
    : T extends Resource
      ? Omit<Resource, 'bag'>
      : never;

export type TClientLootItem = ClientItem<Weapon | Armor | Resource>;

export interface LootDrop {
  item: TClientLootItem;
  amount: number;
}
