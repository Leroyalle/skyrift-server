import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EquipmentOwnerType } from '../types/equipment-owner-type';

import { Equipment } from './entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  public async findEquipmentByRef(ref: EntityRef) {
    return await this.equipmentRepository.findOneBy({
      ownerId: ref.id,
      ownerType: ref.type as EquipmentOwnerType,
    });
  }

  public async updateEquipment(ref: EntityRef, payload: Partial<Equipment>) {
    let equipment = await this.findEquipmentByRef(ref);

    if (!equipment) {
      equipment = this.equipmentRepository.create({
        ownerId: ref.id,
        ownerType: ref.type as EquipmentOwnerType,
        ...payload,
      });
    } else {
      Object.assign(equipment, payload);
    }

    return await this.equipmentRepository.save(equipment);
  }
}
