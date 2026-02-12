
import { Injectable } from '@nestjs/common';

import { LootRuntimeService } from './loot-runtime.service';
import { LootService } from './loot.service';
import { LootDrop,  } from './types/loot.types';




@Injectable()
export class LootInteractionService {
  constructor(
    private readonly lootRuntime: LootRuntimeService,
    private readonly lootService: LootService,
  ) {}

  public openLoot(
    sourceId: string,
    characterId: string,
    locationId: string,
  ):
    | LootDrop[]
    | undefined {
    const ctx = this.lootRuntime.getById(sourceId);
    if (!ctx) throw new Error('Loot not found');

    if (ctx.source.locationId !== locationId) throw new Error('Wrong location');

    if (!ctx.allowedLooters.has(characterId)) throw new Error('Access denied');

    if (!ctx.perPlayerLoot.get(characterId)) {
      ctx.perPlayerLoot.set(characterId, this.lootService.generateLoot(ctx.lootItems));
    }
    const currentLoot = ctx.perPlayerLoot.get(characterId);
    if (!currentLoot) return undefined;

    return currentLoot.map(slot => ({
      amount: slot.amount,
      item: {
        iconKey: slot.item.iconKey,
        id: slot.item.id,
        itemType: slot.item.itemType,
        name: slot.item.name,
        description: slot.item.description,
        durability: slot.item.durability,
        magicDamage: slot.item.magicDamage,
        magicDefense: ,
        physicalDamage:,
        physicalDefense:,
        bag,
        slot,
        texture


      },
    }));
  }

  public takeItem(sourceId: string, characterId: string, itemId: string) {
    const ctx = this.lootRuntime.getById(sourceId);
    if (!ctx) throw new Error('Loot not found');

    const loot = ctx.perPlayerLoot.get(characterId);
    if (!loot) throw new Error('No loot opened');

    const lootIndex = loot.findIndex(lootItem => lootItem.item.id === itemId);
    if (lootIndex === -1) throw new Error('Item not found in loot');

    const [drop] = loot.splice(lootIndex, 1);

    if (loot.length === 0) {
      ctx.perPlayerLoot.delete(characterId);
    }

    if (ctx.perPlayerLoot.size === 0) {
      this.lootRuntime.removeById(sourceId);
    }

    return drop;
  }
}
