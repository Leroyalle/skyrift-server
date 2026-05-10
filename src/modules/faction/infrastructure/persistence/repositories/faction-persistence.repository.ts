import { FactionPersistenceRepositoryPort } from 'src/modules/faction/domain/ports/faction-persistence-repository.port';
import { Faction } from 'src/modules/faction/domain/types/faction.type';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FactionOrmEntity } from '../entities/faction-orm.entity';

@Injectable()
export class FactionPersistenceRepository implements FactionPersistenceRepositoryPort {
  constructor(
    @InjectRepository(FactionOrmEntity) private readonly repository: Repository<FactionOrmEntity>,
  ) {}

  public async save(ormEntity: FactionOrmEntity): Promise<Faction> {
    return this.repository.save(ormEntity);
  }

  public async findAll(): Promise<Faction[]> {
    return this.repository.find();
  }

  public async findById(id: string): Promise<Faction | null> {
    return this.repository.findOneBy({ id });
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
