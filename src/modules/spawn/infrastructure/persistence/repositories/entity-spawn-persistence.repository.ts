import type { EntitySpawnRepositoryPort } from 'src/modules/spawn/domain/ports/entity-spawn-repository.port';
import type { IEntitySpawn } from 'src/modules/spawn/domain/types/entity-spawn.type';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntitySpawnOrmEntity } from '../entities/entity-spawn-orm.entity';

@Injectable()
export class EntitySpawnPersistenceRepository implements EntitySpawnRepositoryPort {
  constructor(
    @InjectRepository(EntitySpawnOrmEntity)
    private readonly repository: Repository<EntitySpawnOrmEntity>,
  ) {}

  public async delete(id: IEntitySpawn['id']): Promise<void> {
    await this.repository.delete(id);
  }

  public getAll(): Promise<IEntitySpawn[]> {
    return this.repository.find();
  }

  public async save(spawn: IEntitySpawn): Promise<void> {
    await this.repository.save(spawn);
  }

  public get(id: IEntitySpawn['id']): Promise<IEntitySpawn | null> {
    return this.repository.findOne({ where: { id } });
  }
}
