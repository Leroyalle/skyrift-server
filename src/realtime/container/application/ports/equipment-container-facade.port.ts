import type {
  EquipmentSlot,
  RuntimeEquippableItem,
} from '../../domain/entities/equipment-container.entity';

export interface EquipmentContainerFacadePort {
  getEquipmentSlotById(id: string, slot: EquipmentSlot): Promise<RuntimeEquippableItem | null>;
  getEquippedItems(id: string): Promise<Record<EquipmentSlot, RuntimeEquippableItem | null>>;
}
