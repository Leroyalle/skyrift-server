import type { EquipmentRepositoryPort } from 'src/modules/equipment/domain/ports/equipment-repository.port';
import type { IEquipment } from 'src/modules/equipment/domain/types/equipment.type';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EquipmentOrmEntity } from '../entities/equipment-orm.entity';

@Injectable()
export class EquipmentPersistenceRepository implements EquipmentRepositoryPort {
  constructor(
    @InjectRepository(EquipmentOrmEntity)
    private readonly repository: Repository<EquipmentOrmEntity>,
  ) {}

  public async save(equipment: IEquipment): Promise<void> {
    await this.repository.save(equipment);
  }

  public update(equipment: IEquipment): Promise<void> {
    return this.save(equipment);
  }

  public async delete(equipment: IEquipment): Promise<void> {
    await this.repository.remove(equipment);
  }

  public findByCharacterId(characterId: IEquipment['characterId']): Promise<IEquipment | null> {
    return this.repository.findOneBy({ characterId });
  }

  public findById(id: IEquipment['id']): Promise<IEquipment | null> {
    return this.repository.findOneBy({ id });
  }
}
