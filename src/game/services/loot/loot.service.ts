import { Injectable } from '@nestjs/common';

import { ItemRegistryService } from '../item-registry/item-registry.service';

import { LootDrop, LootItem, LootRarity } from './types/loot.types';

@Injectable()
export class LootService {
  constructor(private readonly itemRegistry: ItemRegistryService) {}
  private readonly rarityMultiplier = {
    [LootRarity.COMMON]: 1,
    [LootRarity.UNCOMMON]: 0.8,
    [LootRarity.RARE]: 0.5,
    [LootRarity.EPIC]: 0.2,
    [LootRarity.LEGENDARY]: 0.05,
  };

  public generateLoot(lootData: LootItem[]): LootDrop[] {
    const generateLoot: LootDrop[] = [];

    for (const lootItem of lootData) {
      if (!this.rollDrop(lootItem)) continue;

      const item = this.itemRegistry.getById(lootItem.itemId);

      if (!item) {
        console.warn(`item with id: ${lootItem.itemId} not found in registry`);
        continue;
      }
      const amount = this.rollAmount(lootItem);

      generateLoot.push({
        item: { ...item, rarity: lootItem.rarity },
        amount,
      });
    }
    return generateLoot;
  }

  private rollDrop(lootItem: LootItem): boolean {
    if (lootItem.guaranteed) return true;
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
      throw new Error(`Invalid amount range: min:${min} max:${max} name: `);
    }
    const baseAmount = Math.floor(Math.random() * (max - min + 1)) + min;
    const rarityMultiplier = this.rarityMultiplier[lootItem.rarity] ?? 1;
    const finalAmount = Math.floor(baseAmount * rarityMultiplier);
    return Math.max(finalAmount, 1);
  }

  private assertChance(chance: number) {
    if (chance < 0 || chance > 1) {
      throw new Error(`Chance must be between 0 and 1. Got ${chance}`);
    }
  }
}
