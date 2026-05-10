import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';

import type { RuntimeContainerType, RuntimeEquippableItem } from './runtime-item.type';

export interface IEquipmentContainer {
  id: string;
  type: RuntimeContainerType;
  slots: Record<EquipmentSlot, RuntimeEquippableItem | null>;
}
