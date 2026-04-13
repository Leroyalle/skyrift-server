import { In, type Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import type { ItemTemplateRepositoryPort } from '../../domain/ports/item-tempalte-repository.port';
import type { ItemTemplate } from '../../domain/types/item-template.type';
import { ItemTemplateOrmEntity } from '../entities/item-template-orm.entity';

@Injectable()
export class ItemTemplateRepository implements ItemTemplateRepositoryPort {
  constructor(
    @InjectRepository(ItemTemplateOrmEntity)
    private readonly repository: Repository<ItemTemplateOrmEntity>,
  ) {}

  public async save(itemTemplate: ItemTemplate): Promise<void> {
    await this.repository.save(itemTemplate);
  }

  public async delete(itemTemplate: ItemTemplate): Promise<void> {
    await this.repository.remove(itemTemplate);
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
