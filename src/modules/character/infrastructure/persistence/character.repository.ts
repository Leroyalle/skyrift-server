import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import type { Character } from '../../domain/entities/character.entity';
import type { CharacterRepositoryPort } from '../../domain/ports/character-repository.port';

import { CharacterOrmEntity } from './character-orm.entity';
import { CharacterMapper } from './character.mapper';

@Injectable()
export class CharacterRepository implements CharacterRepositoryPort {
  constructor(
    @InjectRepository(CharacterOrmEntity)
    private readonly characterRepository: Repository<CharacterOrmEntity>,
  ) {}

  public async create(domain: Character): Promise<Character> {
    const persistence = CharacterMapper.toPersistence(domain);

    const saved = await this.characterRepository.save(persistence);

    return CharacterMapper.toDomain(saved);
  }

  public async remove(id: string): Promise<void> {
    await this.characterRepository.delete(id);
  }

  public async findAll(): Promise<Character[]> {
    const characters = await this.characterRepository.find();

    return characters.map(CharacterMapper.toDomain);
  }

  public async update(payload: Character): Promise<Character> {
    const persistence = CharacterMapper.toPersistence(payload);
    const character = await this.characterRepository.preload(persistence);

    if (!character) throw new Error('Персонаж не найден');

    const result = await this.characterRepository.save(character);

    return CharacterMapper.toDomain(result);
  }

  public async findOwnedCharacter(
    userId: string,
    characterId: string,
  ): Promise<Character | undefined> {
    const result = await this.characterRepository.findOne({
      where: {
        id: characterId,
        userId,
      },
    });

    return result ? CharacterMapper.toDomain(result) : undefined;
  }

  public async findUserCharacters(userId: string): Promise<Character[] | undefined> {
    const result = await this.characterRepository.find({
      where: {
        userId,
      },
    });

    return result.map(CharacterMapper.toDomain);
  }
}
