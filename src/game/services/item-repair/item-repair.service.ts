import { Armor, Weapon } from 'src/item/entities/item.entity';

import { Injectable } from '@nestjs/common';

type RepairableItem = Weapon | Armor;

@Injectable()
export class ItemRepairService {
  private readonly baseRepairCost = 100;

  public repairItem(
    item: RepairableItem,
    currentGold: number,
  ): { newGold: number; repairedItem: RepairableItem; cost: number } {
    this.assertRepairable(item);

    if (this.isFullyRepaired(item)) {
      throw new Error('Item does not need repair');
    }

    const cost = this.calculateRepairCost(item);

    this.assertEnoughGold(currentGold, cost);

    const repairedItem = this.applyRepair(item);
    const newGold = currentGold - cost;

    return { newGold, repairedItem, cost };
  }

  private assertRepairable(item: RepairableItem) {
    if (typeof item.durability !== 'number') {
      throw new Error('Item has no durability');
    }
  }

  private isFullyRepaired(item: RepairableItem): boolean {
    return item.durability >= 1;
  }

  private assertEnoughGold(currentGold: number, cost: number) {
    if (currentGold < cost) {
      throw new Error('Not enough gold');
    }
  }

  private calculateRepairCost(item: RepairableItem): number {
    const missingDurability = 1 - item.durability;

    const rarityMultiplier = this.getRarityMultiplier(item.rarity);

    const cost = this.baseRepairCost * missingDurability * rarityMultiplier;

    return Math.ceil(cost);
  }

  private applyRepair(item: RepairableItem): RepairableItem {
    item.durability = 1;
    return item;
  }

  private getRarityMultiplier(rarity?: string): number {
    switch (rarity) {
      case 'COMMON':
        return 1;
      case 'UNCOMMON':
        return 1.2;
      case 'RARE':
        return 1.5;
      case 'EPIC':
        return 2;
      case 'LEGENDARY':
        return 3;
      default:
        return 1;
    }
  }
}
