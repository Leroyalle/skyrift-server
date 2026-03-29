import type { BaseItem } from './runtime-item.type';

export interface RuntimeEquippableItem extends BaseItem {
  templateId: string;
  itemType: 'weapon' | 'armor';
  slot: EquipmentSlot;

  durability: number;
  rarity: 'common' | 'rare' | 'epic';

  stats: {
    physicalDamage?: number;
    magicDamage?: number;
    physicalDefense?: number;
    magicDefense?: number;
    maxHp?: number;
  };

  requirements?: {
    level?: number;
    classId?: string;
  };

  effects?: Array<{
    effectId: string;
    value: number;
  }>;
}

export type EquipmentSlot =
  | 'helmet'
  | 'breastplate'
  | 'gloves'
  | 'legs'
  | 'cloak'
  | 'mainHand'
  | 'offHand'
  | 'ring1'
  | 'ring2';
