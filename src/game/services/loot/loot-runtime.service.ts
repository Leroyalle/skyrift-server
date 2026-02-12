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
  get lootArray(): LootContext[] {
    return Array.from(this.lootContext.values());
  }

  public getAll() {
    return this.lootContext;
  }

  public getById(sourceId: string): LootContext | undefined {
    return this.lootContext.get(sourceId);
  }

  public removeById(sourceId: string) {
    this.lootContext.delete(sourceId);
  }
}
