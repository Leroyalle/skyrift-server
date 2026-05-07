import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';

export interface RequestEquipItemDto {
  itemId: string;
  slot: EquipmentSlot;
}
