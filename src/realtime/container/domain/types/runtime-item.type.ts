import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';

export interface RuntimeItem {
  id: string;
  templateId: string;

  containerId: string;
  containerType: ItemContainerType;

  quantity: number;
  durability: number;

  physicalDamage: number | null;
  magicDamage: number | null;
  physicalDefense: number | null;
  magicDefense: number | null;

  name: string;
  itemType: 'weapon' | 'armor' | 'resource' | 'consumable';
  slot: EquipmentSlot | null;
  iconKey: string;
  texture: TextureConfig;
}

export type RuntimeEquippableItem = RuntimeItem & {
  itemType: 'weapon' | 'armor';
  slot: EquipmentSlot;
};

export type ItemContainerType = 'bag' | 'equipment';
export type RuntimeContainerType = 'bag' | 'equipment' | 'chest' | 'ground';

interface TextureConfig {
  atlasKey: string;
  frameName: string;
}
