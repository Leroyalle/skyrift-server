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

  public findByCharacterId(characterId: IEquipment['characterId']): Promise<IEquipment | null> {
    return this.equipmentRepository.findByCharacterId(characterId);
  }

  public delete(equipment: IEquipment): Promise<void> {
    return this.equipmentRepository.delete(equipment);
  }

  public findById(id: IEquipment['id']): Promise<IEquipment | null> {
    return this.equipmentRepository.findById(id);
  }

  public save(equipment: IEquipment): Promise<void> {
    return this.equipmentRepository.save(equipment);
  }

  public update(equipment: IEquipment): Promise<void> {
    return this.equipmentRepository.update(equipment);
  }
}
