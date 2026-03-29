import type { EquipmentSlot, RuntimeEquippableItem } from '../../domain/types/equippable-item.type';

export interface EquipmentContainerFacadePort {
  getEquipmentSlotById(id: string, slot: EquipmentSlot): Promise<RuntimeEquippableItem | null>;
  getEquippedItems(id: string): Promise<Record<EquipmentSlot, RuntimeEquippableItem | null>>;
}
