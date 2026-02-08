import { LootDrop, LootItem } from './loot.types';

export type LootSourceType = 'mob' | 'chest';

export interface LootSource {
  id: string;
  type: LootSourceType;
  locationId: string;
}

export interface LootContext {
  source: LootSource;
  lootItems: LootItem[];
  allowedLooters: Set<string>;
  perPlayerLoot: Map<string, LootDrop[]>;
  createdAt: number;
}
