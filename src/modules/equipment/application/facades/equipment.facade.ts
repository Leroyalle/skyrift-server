import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import type { EquipmentRepositoryPort } from '../../domain/ports/equipment-repository.port';
import type { IEquipment } from '../../domain/types/equipment.type';
import type { EquipmentFacadePort } from '../ports/equipment-facade.port';
import { EQUIPMENT_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class EquipmentFacade implements EquipmentFacadePort {
  constructor(
    @Inject(EQUIPMENT_REPOSITORY_TOKEN)
    private readonly equipmentRepository: EquipmentRepositoryPort,
  ) {}

  public findByOwnerRef(characterId: IEquipment['ownerRef']): Promise<IEquipment | null> {
    return this.equipmentRepository.findByOwnerRef(characterId);
  }

  public delete(id: IEquipment['id']): Promise<void> {
    return this.equipmentRepository.delete(id);
  }

  public findById(id: IEquipment['id']): Promise<IEquipment | null> {
    return this.equipmentRepository.findById(id);
  }

  public save(equipment: Omit<IEquipment, 'id'>): Promise<IEquipment> {
    return this.equipmentRepository.save({ id: randomUUID(), ...equipment });
  }

  public update(id: IEquipment['id'], equipment: IEquipment): Promise<void> {
    return this.equipmentRepository.update(equipment);
  }
}
