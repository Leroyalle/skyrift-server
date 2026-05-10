import type { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { CharacterClass } from '../../domain/entities/character-class.entity';
import type { CharacterClassRepositoryPort } from '../../domain/ports/character-class.repository';

import { CharacterClassOrmEntity } from './character-class-orm.entity';
import { CharacterClassMapper } from './character-class.mapper';

export class CharacterClassRepository implements CharacterClassRepositoryPort {
  constructor(
    @InjectRepository(CharacterClassOrmEntity)
    private readonly repository: Repository<CharacterClassOrmEntity>,
  ) {}

  public async create(domain: CharacterClass): Promise<CharacterClass> {
    const persistence = CharacterClassMapper.toPersistence(domain);

    const result = await this.repository.save(persistence);

    return CharacterClassMapper.toDomain(result);
  }

  public async findAll(): Promise<CharacterClass[]> {
    const result = await this.repository.find();

    return result.map(CharacterClassMapper.toDomain);
  }

  public async findOne(id: string): Promise<CharacterClass | undefined> {
    const result = await this.repository.findOne({ where: { id } });

    if (!result) return;

    return CharacterClassMapper.toDomain(result);
  }

  public async update(domain: CharacterClass): Promise<CharacterClass> {
    const persistence = CharacterClassMapper.toPersistence(domain);

    const result = await this.repository.save(persistence);

    return CharacterClassMapper.toDomain(result);
  }

  public async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
