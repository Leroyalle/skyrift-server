import { Injectable } from '@nestjs/common';

import { LootContext, LootSource } from './types/loot-runtime.types';
import { LootItem } from './types/loot.types';

@Injectable()
export class LootRuntimeService {
  private readonly lootContext = new Map<string, LootContext>();

  public add(source: LootSource, lootItems: LootItem[], allowedLootersList: string[]) {
    const allowedLooters = new Set<string>();
    for (const playerId of allowedLootersList) {
      allowedLooters.add(playerId);
    }
    this.lootContext.set(source.id, {
      source,
      lootItems,
      allowedLooters,
      perPlayerLoot: new Map(),
      createdAt: Date.now(),
    });
  }

  public takeLoot(
    sourceId: string,
    characterId: string,
    itemId: string,
  ): {
    success: boolean;
    message?: string;
  } {
    const lootSource = this.lootContext.get(sourceId);
    if (!lootSource) return { success: false, message: 'Loot not found' };

    const loot = lootSource.perPlayerLoot.get(characterId);
    if (!loot) return { success: false, message: 'No loot available for you ☝️🤓' };

    const drop = loot.find(d => d.item.id === itemId);
    if (!drop) return { success: false, message: 'Item not found in loot' };

    const lootIndex = loot.indexOf(drop);
    loot.splice(lootIndex, 1);

    return { success: true };
  }

  public getById(sourceId: string): LootContext | undefined {
    return this.lootContext.get(sourceId);
  }

  public removeById(sourceId: string) {
    this.lootContext.delete(sourceId);
  }
}
