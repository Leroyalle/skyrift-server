import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';

export interface ItemTemplate {
  id: string;
  name: string;
  itemType: 'weapon' | 'armor' | 'resource' | 'consumable';
  slot: EquipmentSlot | null;
  iconKey: string;
  texture: TextureConfig;

  physicalDamage: number | null;
  magicDamage: number | null;

  physicalDefense: number | null;
  magicDefense: number | null;
}

interface TextureConfig {
  atlasKey: string;
  frameName: string;
}
