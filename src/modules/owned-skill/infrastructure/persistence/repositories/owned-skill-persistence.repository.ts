import type { OwnedSkill } from 'src/modules/owned-skill/domain/entities/owned-skill.entity';
import type { OwnedSkillPersistenceRepositoryPort } from 'src/modules/owned-skill/domain/ports/owned-skill-persistence-repository.port';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { OwnedSkillOrmEntity } from '../entities/owned-skill-orm.entity';
import { OwnedSkillMapper } from '../mappers/owned-skill.mapper';

@Injectable()
export class OwnedSkillPersistenceRepository implements OwnedSkillPersistenceRepositoryPort {
  constructor(
    @InjectRepository(OwnedSkillOrmEntity)
    private readonly repository: Repository<OwnedSkillOrmEntity>,
  ) {}

  public async save(domain: OwnedSkill): Promise<OwnedSkill> {
    const persistence = OwnedSkillMapper.toPersistence(domain);
    const result = await this.repository.save(persistence);
    return OwnedSkillMapper.toDomain(result);
  }

  public async findById(id: OwnedSkill['id']): Promise<OwnedSkill | null> {
    const result = await this.repository.findOneBy({ id });
    return result ? OwnedSkillMapper.toDomain(result) : null;
  }

  public async findByOwnerRef(ownerRef: OwnedSkill['ownerRef']): Promise<OwnedSkill[]> {
    const result = await this.repository.find({
      where: { ownerId: ownerRef.id, ownerType: ownerRef.type },
    });
    return result.map(OwnedSkillMapper.toDomain);
  }

  public async remove(id: OwnedSkill['id']): Promise<void> {
    await this.repository.delete(id);
  }

  public async update(domain: OwnedSkill): Promise<void> {
    await this.repository.save(OwnedSkillMapper.toPersistence(domain));
  }

  public async findBySkillId(skillId: OwnedSkill['skillId']): Promise<OwnedSkill[]> {
    const result = await this.repository.find({ where: { skillId } });
    return result.map(OwnedSkillMapper.toDomain);
  }
}
