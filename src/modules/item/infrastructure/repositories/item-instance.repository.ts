import { In, type Repository } from 'typeorm';

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

  public async delete(id: ItemInstance['id']): Promise<void> {
    await this.repository.delete({ id });
  }

  public async save(itemInstance: ItemInstance): Promise<void> {
    await this.repository.save(itemInstance);
  }

  public async findById(id: ItemInstance['id']): Promise<ItemInstance | null> {
    return this.repository.findOneBy({ id });
  }

  public async findByContainer(
    containerId: ItemInstance['containerId'],
    containerType: ItemInstance['containerType'],
  ): Promise<ItemInstance[]> {
    return this.repository.findBy({ containerId, containerType });
  }

  public async findByOwner(
    ownerId: ItemInstance['ownerId'],
    ownerType: ItemInstance['ownerType'],
  ): Promise<ItemInstance[]> {
    return this.repository.findBy({ ownerId, ownerType });
  }

  public async findByIds(ids: ItemInstance['id'][]): Promise<ItemInstance[]> {
    return this.repository.findBy({ id: In(ids) });
  }
}
