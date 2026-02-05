import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { ItemRegistryService } from 'src/game/services/item-registry/item-registry.service';
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
    private readonly itemRegistryService: ItemRegistryService,
  ) {}

  public create(input: { itemType: ItemTypeEnum.WEAPON } & Omit<Weapon, 'id'>): Weapon;
  public create(input: { itemType: ItemTypeEnum.ARMOR } & Omit<Armor, 'id'>): Armor;
  public create(input: { itemType: ItemTypeEnum.RESOURCE } & Omit<Resource, 'id'>): Resource;

  public create(input: CreateItemInput): Weapon | Armor | Resource {
    switch (input.itemType) {
      case ItemTypeEnum.WEAPON:
        return this.weaponRepo.create(input);
      case ItemTypeEnum.ARMOR:
        return this.armorRepo.create(input);
      case ItemTypeEnum.RESOURCE:
        return this.resourceRepo.create(input);
      default:
        throw new Error('Unknown itemType in create method');
    }
  }

  public async createAndSave(input: CreateItemInput): Promise<Weapon | Armor | Resource> {
    let item: Weapon | Armor | Resource;

    switch (input.itemType) {
      case ItemTypeEnum.WEAPON: {
        // const weapon = this.create(input);
        // return this.weaponRepo.save(weapon);
        item = this.create(input);
        item = await this.weaponRepo.save(item);
        break;
      }

      case ItemTypeEnum.ARMOR: {
        item = this.create(input);
        item = await this.armorRepo.save(item);
        break;
        // const armor = this.create(input);
        // return this.armorRepo.save(armor);
      }

      case ItemTypeEnum.RESOURCE: {
        // const resource = this.create(input);
        // return this.resourceRepo.save(resource);
        item = this.create(input);
        item = await this.resourceRepo.save(item);
        break;
      }

      default:
        throw new Error('Unknown itemType');
    }
    this.itemRegistryService.add(item);
    return item;
  }

  public async findAllItems() {
    const [weapons, armors, resources] = await Promise.all([
      this.weaponRepo.find(),
      this.armorRepo.find(),
      this.resourceRepo.find(),
    ]);
    return [...weapons, ...armors, ...resources];
  }
}
