import { registerEnumType } from '@nestjs/graphql';

export enum ArmorSlotEnum {
  HELMET = 'helmet',
  BREASTPLATE = 'breastplate',
  GLOVES = 'gloves',
  LEGS = 'legs',
  CLOAK = 'cloak',
}

export enum WeaponSlotEnum {
  MAIN_HAND = 'mainHand',
  OFF_HAND = 'offHand',
}

export enum AccessorySlotEnum {
  RING_1 = 'ring1',
  RING_2 = 'ring2',
}

export type EquipmentSlotEnum = ArmorSlotEnum | WeaponSlotEnum | AccessorySlotEnum;

registerEnumType(ArmorSlotEnum, {
  name: 'ArmorSlotEnum',
  description: 'Слоты брони',
});

registerEnumType(WeaponSlotEnum, {
  name: 'WeaponSlotEnum',
  description: 'Слоты оружия',
});

registerEnumType(AccessorySlotEnum, {
  name: 'AccessorySlotEnum',
  description: 'Слоты акксесуаров',
});
