import { Injectable } from '@nestjs/common';
import { CreateCharacterClassInput } from './dto/create-character-class.input';
import { UpdateCharacterClassInput } from './dto/update-character-class.input';

@Injectable()
export class CharacterClassService {
  create(createCharacterClassInput: CreateCharacterClassInput) {
    return 'This action adds a new characterClass';
  }

  findAll() {
    return `This action returns all characterClass`;
  }

  findOne(id: number) {
    return `This action returns a #${id} characterClass`;
  }

  update(id: number, updateCharacterClassInput: UpdateCharacterClassInput) {
    return `This action updates a #${id} characterClass`;
  }

  remove(id: number) {
    return `This action removes a #${id} characterClass`;
  }
}
