import { Injectable } from '@nestjs/common';
import { CreateCharacterInput } from './dto/create-character.input';
import { UpdateCharacterInput } from './dto/update-character.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}
  create(createCharacterInput: CreateCharacterInput) {
    return 'This action adds a new character';
  }

  findAll() {
    return `This action returns all character`;
  }

  public async findUserCharacters(userId: string) {
    return await this.characterRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        characterClass: {
          faction: true,
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} character`;
  }

  update(id: number, updateCharacterInput: UpdateCharacterInput) {
    return `This action updates a #${id} character`;
  }

  remove(id: number) {
    return `This action removes a #${id} character`;
  }
}
