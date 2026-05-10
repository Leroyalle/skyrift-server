import type { RuntimeEquippableItem, RuntimeItem } from '../types/runtime-item.type';

export function isEquippableItem(item: RuntimeItem): item is RuntimeEquippableItem {
  return item.itemType === 'weapon' || item.itemType === 'armor';
}
