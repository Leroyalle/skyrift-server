import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Bag } from './entities/bag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TItem } from 'src/common/types/item.type';

@Injectable()
export class BagService {
  constructor(@InjectRepository(Bag) private readonly bagRepository: Repository<Bag>) {}

  public async addToDb(id: string, item: TItem) {
    const bag = await this.bagRepository.findOne({ where: { id } });
    if (!bag) return;
    bag.items.push(item);
    await this.bagRepository.save(bag);
  }
}
