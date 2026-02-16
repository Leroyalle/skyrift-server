import { ItemTypeEnum } from 'src/common/enums/item-type.enum';

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
  guaranteed?: boolean;
}

export interface ClientItem {
  id: string;
  name: string;
  iconKey: string;
  itemType: ItemTypeEnum;
  rarity: LootRarity;
}
export interface LootDrop {
  item: ClientItem &
    (
      | {
          itemType: ItemTypeEnum.WEAPON;
          physicalDamage: number;
          magicDamage: number;
          durability?: number;
        }
      | {
          itemType: ItemTypeEnum.ARMOR;
          physicalDefense: number;
          magicDefense: number;
          durability?: number;
        }
      | { itemType: ItemTypeEnum.RESOURCE; description: string }
    );
  amount: number;
}
