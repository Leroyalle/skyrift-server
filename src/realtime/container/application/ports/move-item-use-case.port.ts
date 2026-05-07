import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';

import type { Changes } from '../types/changes.type';

export interface MoveFromBagToEquipmentPayload {
  bagId: string;
  equipmentId: string;
  itemId: string;
  slot: EquipmentSlot;
}

export interface MoveFromEquipmentToBagPayload {
  equipmentId: string;
  bagId: string;
  slot: EquipmentSlot;
}

export interface MoveItemUseCasePort {
  moveFromBagToEquipment(payload: MoveFromBagToEquipmentPayload): Changes[];
  moveFromEquipmentToBag(payload: MoveFromEquipmentToBagPayload): Changes[];
}
