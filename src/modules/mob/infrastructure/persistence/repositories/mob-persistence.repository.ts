import type { Mob } from 'src/modules/mob/domain/entities/mob.entity';
import type { MobPersistenceRepositoryPort } from 'src/modules/mob/domain/ports/mob-persistence-repository.port';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MobOrmEntity } from '../entities/mob-orm.entity';
import { MobMapper } from '../mappers/mob.mapper';

@Injectable()
export class MobPersistenceRepository implements MobPersistenceRepositoryPort {
  constructor(
    @InjectRepository(MobOrmEntity) private readonly mobRepository: Repository<MobOrmEntity>,
  ) {}

  public async save(mob: Mob): Promise<void> {
    const persistence = MobMapper.toPersistence(mob);
    await this.mobRepository.save(persistence);
  }

  public async findById(id: string): Promise<Mob | null> {
    const raw = await this.mobRepository.findOneBy({ id });
    if (!raw) {
      return null;
    }
    return MobMapper.toDomain(raw);
  }

  public async remove(id: string): Promise<void> {
    await this.mobRepository.delete({ id });
  }

  public async update(mob: Mob): Promise<void> {
    const persistence = MobMapper.toPersistence(mob);
    await this.mobRepository.save(persistence);
  }
}
