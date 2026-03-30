import type { Quest } from 'src/modules/quest/domain/entities/quest.entity';
import type { QuestRepositoryPort } from 'src/modules/quest/domain/ports/quest-repository.port';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { QuestOrmEntity } from '../entities/quest-orm.entity';
import { QuestMapper } from '../mappers/quest.mapper';

@Injectable()
export class QuestPersistenceRepository implements QuestRepositoryPort {
  constructor(
    @InjectRepository(QuestOrmEntity) private readonly repository: Repository<QuestOrmEntity>,
  ) {}

  public async update(quest: Quest): Promise<void> {
    await this.repository.save(quest);
  }

  public async save(quest: Quest): Promise<void> {
    await this.repository.save(quest);
  }

  public async findById(id: string): Promise<Quest | null> {
    const persistence = await this.repository.findOneBy({ id });
    return persistence ? QuestMapper.toDomain(persistence) : null;
  }

  public async findAll(): Promise<Quest[]> {
    const persistences = await this.repository.find();
    return persistences.map(p => QuestMapper.toDomain(p));
  }

  public async remove(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  public async findByGiverId(giverId: string): Promise<Quest[]> {
    const persistences = await this.repository.findBy({ giverNpcId: giverId });
    return persistences.map(p => QuestMapper.toDomain(p));
  }
}
