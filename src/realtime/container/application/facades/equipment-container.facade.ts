import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryEquipmentContainerRepositoryPort } from '../../domain/ports/in-memory-equipment-container-repository.port';
import type { EquipmentSlot, RuntimeEquippableItem } from '../../domain/types/equippable-item.type';
import type { EquipmentContainerFacadePort } from '../ports/equipment-container-facade.port';
import { EQUIPMENT_CONTAINER_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class EquipmentContainerFacade implements EquipmentContainerFacadePort {
  constructor(
    @Inject(EQUIPMENT_CONTAINER_REPOSITORY_TOKEN)
    private readonly repository: InMemoryEquipmentContainerRepositoryPort,
  ) {}

  public getEquipmentSlotById(
    id: string,
    slot: EquipmentSlot,
  ): Promise<RuntimeEquippableItem | null> {
    const equipment = this.repository.findById(id);

    if (!equipment) {
      throw new Error('Item not found in container');
    }

    const foundItem = equipment.getItem(slot);

    return Promise.resolve(foundItem ?? null);
  }

  public getEquippedItems(
    id: string,
  ): Promise<Record<EquipmentSlot, RuntimeEquippableItem | null>> {
    const equipment = this.repository.findById(id);

    if (!equipment) {
      throw new Error('Item not found in container');
    }

    const snapshot = equipment.snapshot();

    return Promise.resolve(snapshot.slots);
  }
}
