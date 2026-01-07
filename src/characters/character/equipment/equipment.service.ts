import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Equipment } from './entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  public async findCharacterEquipment(characterId: string) {
    return await this.equipmentRepository.findOneBy({
      character: { id: characterId },
    });
  }

  public async updateEquipment(characterId: string, payload: Partial<Equipment>) {
    let equipment = await this.findCharacterEquipment(characterId);

    if (!equipment) {
      equipment = this.equipmentRepository.create({
        character: { id: characterId },
        ...payload,
      });
    } else {
      Object.assign(equipment, payload);
    }

    return await this.equipmentRepository.save(equipment);
  }
}
