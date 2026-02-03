import { ArmorSlotEnum, WeaponSlotEnum } from 'src/common/enums/equipment-slot.enum';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { BaseItem } from 'src/item/entities/item.entity';

export enum LootRarity {
  COMMON = 'common',

  UNCOMMON = 'uncommon',

  RARE = 'rare',

  EPIC = 'epic',

  LEGENDARY = 'legendary',
}

export interface BaseLoot {
  chance: number;

  rarity: LootRarity;

  minAmount?: number;

  maxAmount?: number;

  name: string;

  iconKey: string;
}

export interface WeaponLoot extends BaseLoot {
  itemType: ItemTypeEnum.WEAPON;

  weaponSlot: WeaponSlotEnum;
  physicalDamage?: number;
  magicDamage?: number;
  durability?: number;
  texture: {
    atlasKey: string;
    frameName: string;
  };
}

export interface ArmorLoot extends BaseLoot {
  itemType: ItemTypeEnum.ARMOR;

  armorSlot: ArmorSlotEnum;
  magicDefense: number;
  physicalDefense?: number;
  durability?: number;
  texture: {
    atlasKey: string;
    frameName: string;
  };
}

export interface ResourceLoot extends BaseLoot {
  itemType: ItemTypeEnum.RESOURCE;
  description: string;
  atlasKey: string;
}

export type LootItem = WeaponLoot | ArmorLoot | ResourceLoot;

export interface LootDrop {
  item: BaseItem;
  amount: number;
}
