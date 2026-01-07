import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CharacterSkillResolver } from './character-skill.resolver';
import { CharacterSkillService } from './character-skill.service';
import { CharacterSkill } from './entities/character-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterSkill])],
  providers: [CharacterSkillResolver, CharacterSkillService],
})
export class CharacterSkillModule {}
