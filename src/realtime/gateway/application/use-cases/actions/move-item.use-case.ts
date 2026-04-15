import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';
import { MOVE_ITEM_USE_CASE_TOKEN, type MoveItemUseCasePort } from 'src/realtime/container';

import { Inject, Injectable } from '@nestjs/common';

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

@Injectable()
export class MoveItemUseCase {
  constructor(
    @Inject(MOVE_ITEM_USE_CASE_TOKEN) private readonly moveItemUseCase: MoveItemUseCasePort,
  ) {}

  public moveFromBagToEquipment(payload: MoveFromBagToEquipmentPayload) {
    return this.moveItemUseCase.moveFromBagToEquipment(payload);
  }
}
