import type { Effect } from 'src/modules/effect/domain/entities/effect.entity';
import type { EffectPersistenceRepositoryPort } from 'src/modules/effect/domain/ports/effect-persistence-repository.port';
import { In, type Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EffectOrmEntity } from '../entities/effect-orm.entity';
import { EffectMapper } from '../mappers/effect.mapper';

@Injectable()
export class EffectPersistenceRepository implements EffectPersistenceRepositoryPort {
  constructor(
    @InjectRepository(EffectOrmEntity) private readonly repository: Repository<EffectOrmEntity>,
  ) {}

  public async save(domain: Effect): Promise<Effect> {
    const result = await this.repository.save(EffectMapper.toPersistence(domain));
    return EffectMapper.toDomain(result);
  }

  public async findById(id: Effect['id']): Promise<Effect | null> {
    const result = await this.repository.findOneBy({ id });
    return result ? EffectMapper.toDomain(result) : null;
  }

  public async findBySkillId(skillId: Effect['skillId']): Promise<Effect[]> {
    const result = await this.repository.find({ where: { skillId } });
    return result.map(EffectMapper.toDomain);
  }

  public async findBySkillsIds(skillIds: Effect['skillId'][]): Promise<Effect[]> {
    const result = await this.repository.find({ where: { skillId: In(skillIds) } });
    return result.map(EffectMapper.toDomain);
  }

  public async remove(id: Effect['id']): Promise<void> {
    await this.repository.delete(id);
  }
}
