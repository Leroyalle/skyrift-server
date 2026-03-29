import { Inject, Injectable } from '@nestjs/common';

import type { EquipmentSlot } from '../../domain/entities/equipment-container.entity';
import { isEquippableItem } from '../../domain/guards/is-equippable-item.guard';
import type { InMemoryBagContainerRepositoryPort } from '../../domain/ports/in-memory-bag-container.port';
import type { InMemoryEquipmentContainerRepositoryPort } from '../../domain/ports/in-memory-equipment-container-repository.port';
import {
  BAG_CONTAINER_REPOSITORY_TOKEN,
  EQUIPMENT_CONTAINER_REPOSITORY_TOKEN,
} from '../ports/tokens';

@Injectable()
export class MoveItemUseCase {
  constructor(
    @Inject(BAG_CONTAINER_REPOSITORY_TOKEN)
    private readonly bagRepository: InMemoryBagContainerRepositoryPort,
    @Inject(EQUIPMENT_CONTAINER_REPOSITORY_TOKEN)
    private readonly equipmentRepository: InMemoryEquipmentContainerRepositoryPort,
  ) {}

  public moveFromBagToEquipment(payload: {
    bagId: string;
    equipmentId: string;
    itemId: string;
    slot: EquipmentSlot;
  }): void {
    const bag = this.bagRepository.findById(payload.bagId);

    if (!bag) throw new Error('Bag container not found');

    const foundItem = bag.findItem(payload.itemId);

    if (!foundItem) throw new Error('Item not found in bag container');

    const equipment = this.equipmentRepository.findById(payload.equipmentId);

    if (!equipment) throw new Error('Equipment not found');

    const foundSlot = equipment.getItem(payload.slot);

    if (foundSlot === undefined) throw new Error('Slot is not found');

    bag.removeItem(payload.itemId);

    if (!isEquippableItem(foundItem)) throw new Error('Item is not equippable');

    equipment.equip(foundItem, payload.slot);
  }
}
