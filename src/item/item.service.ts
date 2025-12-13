import { Injectable } from '@nestjs/common';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Armor, BaseItem, Resource, Weapon } from './entities/item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Armor)
    private readonly armorRepository: Repository<Armor>,
    @InjectRepository(Weapon)
    private readonly weaponRepository: Repository<Weapon>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  public async saveWeapon(item: Omit<Weapon, 'id' | 'itemType'>): Promise<Weapon> {
    return await this.weaponRepository.save(item);
  }
  public createWeapon(item: Omit<Weapon, 'id'>): Weapon {
    return this.weaponRepository.create(item);
  }
}
