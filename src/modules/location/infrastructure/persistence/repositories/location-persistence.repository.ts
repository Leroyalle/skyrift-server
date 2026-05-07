import type { LocationPersistenceRepositoryPort } from 'src/modules/location/domain/ports/location-persistence-repository.port';
import type { ILocation } from 'src/modules/location/domain/types/location.type';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LocationOrmEntity } from '../entities/location-orm.entity';

@Injectable()
export class LocationPersistenceRepository implements LocationPersistenceRepositoryPort {
  constructor(
    @InjectRepository(LocationOrmEntity) private readonly repository: Repository<LocationOrmEntity>,
  ) {}

  public async delete(id: ILocation['id']): Promise<void> {
    await this.repository.delete(id);
  }

  public get(id: ILocation['id']): Promise<ILocation | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  public getAll(): Promise<ILocation[]> {
    return this.repository.find();
  }

  public save(location: ILocation): Promise<ILocation> {
    return this.repository.save(location);
  }
}
