export interface ItemTemplate {
  id: string;
  name: string;
  itemType: 'weapon' | 'armor' | 'resource' | 'consumable';
  slot: EquipmentSlotType | null;
  iconKey: string;
  texture: TextureConfig;

  physicalDamage: number | null;
  magicDamage: number | null;

  physicalDefense: number | null;
  magicDefense: number | null;
}
export type EquipmentSlotType =
  | 'helmet'
  | 'breastplate'
  | 'gloves'
  | 'legs'
  | 'cloak'
  | 'mainHand'
  | 'offHand'
  | 'ring1'
  | 'ring2';

interface TextureConfig {
  atlasKey: string;
  frameName: string;
}
