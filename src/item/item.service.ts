import { Injectable } from '@nestjs/common';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseItem } from './entities/item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(BaseItem)
    private readonly itemRepository: Repository<BaseItem>,
  ) {}

  public async findAll() {
    return await this.itemRepository.find();
  }
}
