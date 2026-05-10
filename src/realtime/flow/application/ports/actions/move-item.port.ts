import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';
import type { Changes } from 'src/realtime/container';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface MoveItemPort {
  moveFromBagToEquipment(payload: MoveFromBagToEquipmentPayload): MoveItemResult;
  moveFromEquipmentToBag(payload: MoveFromEquipmentToBagPayload): MoveItemResult;
}

export interface MoveFromBagToEquipmentPayload {
  characterId: string;
  itemId: string;
  slot: EquipmentSlot;
}

export interface MoveFromEquipmentToBagPayload {
  characterId: string;
  slot: EquipmentSlot;
}

export type MoveItemResult = {
  entityRef: IEntityRef;
  changes: Changes[];
};
