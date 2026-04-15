import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';

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
  moveFromBagToEquipment(payload: MoveFromBagToEquipmentPayload): void;
  moveFromEquipmentToBag(payload: MoveFromEquipmentToBagPayload): void;
}
