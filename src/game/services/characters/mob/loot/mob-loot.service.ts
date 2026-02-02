import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { Armor, BaseItem, Resource, Weapon } from 'src/item/entities/item.entity';
import { ItemService } from 'src/item/item.service';

import { Injectable } from '@nestjs/common';

import { LootDrop, LootItem, LootRarity } from './types/mob-lot.types';

@Injectable()
export class MobLootService {
  constructor(private readonly itemService: ItemService) {}
  private readonly rarityMultiplier = {
    [LootRarity.COMMON]: 1,
    [LootRarity.UNCOMMON]: 0.8,
    [LootRarity.RARE]: 0.5,
    [LootRarity.EPIC]: 0.2,
    [LootRarity.LEGENDARY]: 0.05,
  };

  public async generateLoot(lootData: LootItem[]): Promise<LootDrop[]> {
    const generateLoot: LootDrop[] = [];

    for (const lootItem of lootData) {
      if (!this.rollDrop(lootItem)) continue;

      const amount = this.rollAmount(lootItem);

      const item = await this.itemService.createAndSave(lootItem);
      generateLoot.push({ item, amount });
    }
    return generateLoot;
  }

  private rollDrop(lootItem: LootItem): boolean {
    this.assertChance(lootItem.chance);
    const rarityMultiplier = this.rarityMultiplier[lootItem.rarity] ?? 1;
    const finalChance = lootItem.chance * rarityMultiplier;
    const roll = Math.random();
    return roll <= finalChance;
  }

  private rollAmount(lootItem: LootItem): number {
    const min = lootItem.minAmount ?? 1;
    const max = lootItem.maxAmount ?? min;

    if (min <= 0 || max <= 0 || min > max) {
      throw new Error(`Invalid amount range: min:${min} max:${max} name: ${lootItem.name}`);
    }
    const baseAmount = Math.floor(Math.random() * (max - min + 1)) + min;
    const rarityMultiplier = this.rarityMultiplier[lootItem.rarity] ?? 1;
    const finalAmount = Math.floor(baseAmount * rarityMultiplier);
    return Math.max(finalAmount, 1);
  }

  private createItem(lootItem: LootItem): BaseItem {
    switch (lootItem.itemType) {
      case ItemTypeEnum.WEAPON: {
        const weapon = new Weapon();

        weapon.name = lootItem.name;
        weapon.itemType = ItemTypeEnum.WEAPON;
        weapon.iconKey = lootItem.iconKey;
        weapon.slot = lootItem.weaponSlot;
        weapon.physicalDamage = lootItem.physicalDamage ?? 0;
        weapon.magicDamage = lootItem.magicDamage ?? 0;
        weapon.durability = 100;

        if (lootItem.texture) {
          weapon.texture = {
            atlasKey: lootItem.texture.atlasKey,
            frameName: lootItem.texture.frameName,
          };
        }
        return weapon;
      }

      case ItemTypeEnum.ARMOR: {
        const armor = new Armor();

        armor.name = lootItem.name;
        armor.itemType = ItemTypeEnum.ARMOR;
        armor.iconKey = lootItem.iconKey;
        armor.slot = lootItem.armorSlot;
        armor.physicalDefense = lootItem.physicalDefense ?? 0;
        armor.magicDefense = lootItem.magicDefense ?? 0;
        armor.durability = 100;

        if (lootItem.texture) {
          armor.texture = {
            atlasKey: lootItem.texture.atlasKey,
            frameName: lootItem.texture.frameName,
          };
        }
        return armor;
      }

      case ItemTypeEnum.RESOURCE: {
        const resource = new Resource();

        resource.name = lootItem.name;
        resource.itemType = ItemTypeEnum.RESOURCE;
        resource.iconKey = lootItem.iconKey;
        resource.description = lootItem.description;
        return resource;
      }
      default:
        throw new Error(`Unsupported loot item type`);
    }
  }

  private assertChance(chance: number) {
    if (chance < 0 || chance > 1) {
      throw new Error(`Chance must be between 0 and 1. Got ${chance}`);
    }
  }
}
