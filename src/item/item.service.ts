import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Armor, Resource, Weapon } from './entities/item.entity';

type CreateItemInput =
  | ({ itemType: ItemTypeEnum.WEAPON } & Omit<Weapon, 'id'>)
  | ({ itemType: ItemTypeEnum.ARMOR } & Omit<Armor, 'id'>)
  | ({ itemType: ItemTypeEnum.RESOURCE } & Omit<Resource, 'id'>);

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Weapon)
    private readonly weaponRepo: Repository<Weapon>,
    @InjectRepository(Armor)
    private readonly armorRepo: Repository<Armor>,
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,
  ) {}

  public async createAndSave(input: CreateItemInput): Promise<Weapon | Armor | Resource> {
    switch (input.itemType) {
      case ItemTypeEnum.WEAPON: {
        const weapon = this.weaponRepo.create(input);
        return this.weaponRepo.save(weapon);
      }

      case ItemTypeEnum.ARMOR: {
        const armor = this.armorRepo.create(input);
        return this.armorRepo.save(armor);
      }

      case ItemTypeEnum.RESOURCE: {
        const resource = this.resourceRepo.create(input);
        return this.resourceRepo.save(resource);
      }

      default:
        throw new Error('Unknown itemType');
    }
  }
}
