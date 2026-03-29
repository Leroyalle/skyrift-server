import type { RuntimeEquippableItem } from '../types/equippable-item.type';
import type { RuntimeItem } from '../types/runtime-item.type';

export function isEquippableItem(item: RuntimeItem): item is RuntimeEquippableItem {
  return item.itemType === 'weapon' || item.itemType === 'armor';
}
