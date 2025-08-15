import { Injectable } from '@nestjs/common';
import { CreateCharacterSkillInput } from './dto/create-character-skill.input';
import { UpdateCharacterSkillInput } from './dto/update-character-skill.input';

@Injectable()
export class CharacterSkillService {
  create(createCharacterSkillInput: CreateCharacterSkillInput) {
    return 'This action adds a new characterSkill';
  }

  findAll() {
    return `This action returns all characterSkill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} characterSkill`;
  }

  update(id: number, updateCharacterSkillInput: UpdateCharacterSkillInput) {
    return `This action updates a #${id} characterSkill`;
  }

  remove(id: number) {
    return `This action removes a #${id} characterSkill`;
  }
}
