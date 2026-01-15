import { ArmorSlotEnum } from 'src/common/enums/equipment-slot.enum';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { ItemService } from 'src/item/item.service';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Equipment } from './entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    private readonly itemService: ItemService,
  ) {}

  public async createInitEquip() {
    const helmet = await this.itemService.createAndSave({
      itemType: ItemTypeEnum.ARMOR,
      slot: ArmorSlotEnum.HELMET,
      texture: {
        atlasKey: 'helmet_iron',
        frameName: 'helmet-iron',
      },
      physicalDefense: 20,
      name: 'Железный шлем',
      iconKey: 'helmet-iron',
      durability: 1,
      bag: null,
    });

    const breastplate = await this.itemService.createAndSave({
      itemType: ItemTypeEnum.ARMOR,
      slot: ArmorSlotEnum.BREASTPLATE,
      texture: {
        atlasKey: 'body_iron',
        frameName: 'body-iron',
      },
      physicalDefense: 11,
      name: 'Железная броня',
      iconKey: 'body-iron',
      durability: 1,
      bag: null,
    });

    const equipment = this.equipmentRepository.create({
      helmet,
      breastplate,
    });

    return await this.equipmentRepository.save(equipment);
  }
}
