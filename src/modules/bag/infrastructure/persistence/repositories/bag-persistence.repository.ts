import type { BagRepositoryPort } from 'src/modules/bag/domain/ports/bag-repository.port';
import type { IBag } from 'src/modules/bag/domain/types/bag.type';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { BagOrmEntity } from '../entities/bag-orm.entity';

@Injectable()
export class BagPersistenceRepository implements BagRepositoryPort {
  constructor(
    @InjectRepository(BagOrmEntity) private readonly repository: Repository<BagOrmEntity>,
  ) {}

  public save(bag: IBag): Promise<IBag> {
    return this.repository.save(bag);
  }

  public async remove(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  public async get(id: string): Promise<IBag | null> {
    return this.repository.findOneBy({ id });
  }

  public async update(bag: IBag): Promise<void> {
    await this.repository.update({ id: bag.id }, bag);
  }

  public async getByOwner(ownerRef: IEntityRef): Promise<IBag | null> {
    return this.repository.findOneBy({ ownerId: ownerRef.id, ownerType: ownerRef.type });
  }
}
