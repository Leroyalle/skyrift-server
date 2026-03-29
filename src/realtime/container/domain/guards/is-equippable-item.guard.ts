import type { RuntimeItem } from '../entities/bag-container.entity';
import type { RuntimeEquippableItem } from '../entities/equipment-container.entity';

export function isEquippableItem(item: RuntimeItem): item is RuntimeEquippableItem {
  return item.itemType === 'weapon' || item.itemType === 'armor';
}
