import type { EquipmentRepositoryPort } from 'src/modules/equipment/domain/ports/equipment-repository.port';
import type { IEquipment } from 'src/modules/equipment/domain/types/equipment.type';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EquipmentOrmEntity } from '../entities/equipment-orm.entity';
import { EquipmentMapper } from '../mapper/equipment.mapper';

@Injectable()
export class EquipmentPersistenceRepository implements EquipmentRepositoryPort {
  constructor(
    @InjectRepository(EquipmentOrmEntity)
    private readonly repository: Repository<EquipmentOrmEntity>,
  ) {}

  public async save(equipment: IEquipment): Promise<IEquipment> {
    const result = await this.repository.save(EquipmentMapper.toPersistence(equipment));
    return EquipmentMapper.toDomain(result);
  }

  public async update(equipment: IEquipment): Promise<void> {
    await this.save(equipment);
  }

  public async delete(id: IEquipment['id']): Promise<void> {
    await this.repository.delete({ id });
  }

  public async findByOwnerRef(ownerRef: IEquipment['ownerRef']): Promise<IEquipment | null> {
    const persistence = await this.repository.findOneBy({
      ownerType: ownerRef.type,
      ownerId: ownerRef.id,
    });

    if (!persistence) return null;

    return EquipmentMapper.toDomain(persistence);
  }

  public async findById(id: IEquipment['id']): Promise<IEquipment | null> {
    const persistence = await this.repository.findOneBy({ id });
    if (!persistence) return null;
    return EquipmentMapper.toDomain(persistence);
  }
}
