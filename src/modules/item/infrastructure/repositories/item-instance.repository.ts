import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import type { ItemInstanceRepositoryPort } from '../../domain/ports/item-instance-repository.port';
import type { ItemInstance } from '../../domain/types/item-instance.type';
import { ItemInstanceOrmEntity } from '../entities/item-instance-orm.entity';

@Injectable()
export class ItemInstanceRepository implements ItemInstanceRepositoryPort {
  constructor(
    @InjectRepository(ItemInstanceOrmEntity)
    private readonly repository: Repository<ItemInstanceOrmEntity>,
  ) {}

  public async delete(itemInstance: ItemInstance): Promise<void> {
    await this.repository.remove(itemInstance);
  }

  public async save(itemInstance: ItemInstance): Promise<void> {
    await this.repository.save(itemInstance);
  }

  public async findById(id: ItemInstance['id']): Promise<ItemInstance | null> {
    return this.repository.findOneBy({ id });
  }

  public async findByTemplateId(templateId: ItemInstance['templateId']): Promise<ItemInstance[]> {
    return this.repository.findBy({ templateId });
  }
}
