import { In, type Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import type { ItemTemplateRepositoryPort } from '../../domain/ports/item-template-repository.port';
import type { ItemTemplate } from '../../domain/types/item-template.type';
import { ItemTemplateOrmEntity } from '../entities/item-template-orm.entity';

@Injectable()
export class ItemTemplateRepository implements ItemTemplateRepositoryPort {
  constructor(
    @InjectRepository(ItemTemplateOrmEntity)
    private readonly repository: Repository<ItemTemplateOrmEntity>,
  ) {}

  public save(itemTemplate: ItemTemplate): Promise<ItemTemplate> {
    return this.repository.save(itemTemplate);
  }

  public async delete(id: ItemTemplate['id']): Promise<void> {
    await this.repository.delete(id);
  }

  public async find(id: ItemTemplate['id']): Promise<ItemTemplate | null> {
    return this.repository.findOneBy({ id });
  }

  public async findAll(): Promise<ItemTemplate[]> {
    return this.repository.find();
  }

  public async findByIds(ids: ItemTemplate['id'][]): Promise<ItemTemplate[]> {
    return this.repository.findBy({ id: In(ids) });
  }
}
