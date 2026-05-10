import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';

import type { IEquipmentContainer } from '../../domain/types/equipment-container.type';
import type { RuntimeEquippableItem } from '../../domain/types/runtime-item.type';

export interface EquipmentContainerFacadePort {
  getEquipmentSlotById(id: string, slot: EquipmentSlot): Promise<RuntimeEquippableItem | null>;
  getEquippedItems(id: string): Promise<Record<EquipmentSlot, RuntimeEquippableItem | null>>;
  getEquippedItemsList(id: string): RuntimeEquippableItem[];
  getContainerById(id: string): Promise<IEquipmentContainer>;
}
