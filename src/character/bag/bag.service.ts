import { Injectable } from '@nestjs/common';
import { Item } from 'src/item/entities/item.entity';
import { Repository } from 'typeorm';
import { Bag } from './entities/bag.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BagService {
  constructor(
    @InjectRepository(Bag) private readonly bagRepository: Repository<Bag>,
  ) {}

  public async addToDb(id: string, item: Item) {
    const bag = await this.bagRepository.findOne({ where: { id } });
    if (!bag) return;
    bag.items.push(item);
    await this.bagRepository.save(bag);
  }
}
