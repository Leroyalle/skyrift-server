import type { Skill } from 'src/modules/skill/domain/entities/skill.entity';
import type { SkillPersistenceRepositoryPort } from 'src/modules/skill/domain/ports/skill-persistence-repository.port';
import { In, type Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SkillOrmEntity } from '../entities/skill-orm.entity';
import { SkillMapper } from '../mappers/skill.mapper';

@Injectable()
export class SkillPersistenceRepository implements SkillPersistenceRepositoryPort {
  constructor(
    @InjectRepository(SkillOrmEntity) private readonly skillRepository: Repository<SkillOrmEntity>,
  ) {}

  public async save(skill: Skill): Promise<Skill> {
    const persistence = SkillMapper.toPersistence(skill);
    const result = await this.skillRepository.save(persistence);
    return SkillMapper.toDomain(result);
  }

  public async remove(id: string): Promise<void> {
    await this.skillRepository.delete(id);
  }

  public async findById(id: string): Promise<Skill | null> {
    const persistence = await this.skillRepository.findOneBy({ id });
    return persistence ? SkillMapper.toDomain(persistence) : null;
  }
  public async findByIds(ids: string[]): Promise<Skill[]> {
    if (ids.length === 0) return [];
    const persistences = await this.skillRepository.find({
      where: {
        id: In(ids),
      },
    });

    return persistences.map(SkillMapper.toDomain);
  }
}
