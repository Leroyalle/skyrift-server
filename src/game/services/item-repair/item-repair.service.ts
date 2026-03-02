import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { Armor, Weapon } from 'src/item/entities/item.entity';

import { Injectable } from '@nestjs/common';

type RepairableItem = Weapon | Armor;

@Injectable()
export class ItemRepairService {
  private readonly baseRepairCost = 100;

  public getRepairableItems(
    character: IRuntimeCharacter,
  ): ((Armor | Weapon) & { repairCost: number })[] {
    const bagItems = character.bag.items.filter(
      (item): item is Weapon | Armor =>
        (item.itemType === ItemTypeEnum.WEAPON || item.itemType === ItemTypeEnum.ARMOR) &&
        (item as Weapon | Armor).durability < 1,
    );

    const equipItems = Object.values(character.equipment).filter(
      (item): item is Weapon | Armor =>
        item !== null &&
        (item.itemType === ItemTypeEnum.WEAPON || item.itemType === ItemTypeEnum.ARMOR) &&
        (item as Weapon | Armor).durability < 1,
    );
    return [...bagItems, ...equipItems].map(repairItem => ({
      ...repairItem,
      repairCost: this.calculateRepairCost(repairItem),
    }));
  }

  public repairItem(
    item: RepairableItem,
    currentGold: number,
  ): { newGoldCount: number; repairedItem: RepairableItem } {
    this.assertRepairable(item);

    const cost = this.calculateRepairCost(item);

    this.assertEnoughGold(currentGold, cost);

    const repairedItem = this.applyRepair(item);
    const newGoldCount = currentGold - cost;

    return { newGoldCount, repairedItem };
  }

  private assertRepairable(item: RepairableItem) {
    if (typeof item.durability !== 'number') {
      throw new Error('Item cannot be repaired');
    }

    if (item.durability < 0 || item.durability > 1) {
      throw new Error('Invalid durability value');
    }

    if (item.durability === 1) {
      throw new Error('Item is already fully repaired');
    }
  }

  private assertEnoughGold(currentGold: number, cost: number) {
    if (currentGold < cost) {
      throw new Error('Not enough gold');
    }
  }

  private calculateRepairCost(item: RepairableItem): number {
    const missingDurability = 1 - item.durability;

    // const rarityMultiplier = this.getRarityMultiplier(item?.rarity);
    const cost = this.baseRepairCost * missingDurability;

    return Math.ceil(cost);
  }

  private applyRepair(item: RepairableItem): RepairableItem {
    item.durability = 1;
    return item;
  }

  // private getRarityMultiplier(rarity?: string): number {
  //   switch (rarity) {
  //     case 'COMMON':
  //       return 1;
  //     case 'UNCOMMON':
  //       return 1.2;
  //     case 'RARE':
  //       return 1.5;
  //     case 'EPIC':
  //       return 2;
  //     case 'LEGENDARY':
  //       return 3;
  //     default:
  //       return 1;
  //   }
  // }
}
