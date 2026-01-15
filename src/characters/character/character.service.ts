import { equipmentRelations } from 'src/common/constants/equipment-relation.constant';
import { Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateCharacterInput } from './dto/create-character.input';
import { UpdateCharacterInput } from './dto/update-character.input';
import { Character } from './entities/character.entity';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}
  public create(createCharacterInput: CreateCharacterInput) {
    return 'This action adds a new character';
  }

  public findAll() {
    return `This action returns all character`;
  }

  public async findUserCharacters(userId: string) {
    const characters = await this.characterRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        characterClass: {
          faction: true,
        },
      },
    });
    return characters;
  }

  public async findOwnedCharacter(userId: string, characterId: string) {
    return await this.characterRepository.findOne({
      where: {
        id: characterId,
        user: { id: userId },
      },
      relations: {
        characterClass: {
          faction: true,
        },
        location: true,
        user: true,
        characterSkills: {
          skill: true,
        },
        bag: {
          items: true,
        },
        equipment: equipmentRelations,
        quests: {
          quest: true,
        },
      },
    });
  }

  public async update(characterId: string, updateCharacterInput: UpdateCharacterInput) {
    const character = await this.characterRepository.preload({
      ...updateCharacterInput,
      id: characterId,
    });

    if (!character) throw new NotFoundException('Персонаж не найден');

    return await this.characterRepository.save(character);
  }

  public remove(id: number) {
    return `This action removes a #${id} character`;
  }
}
