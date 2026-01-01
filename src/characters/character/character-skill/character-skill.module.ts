import { Module } from '@nestjs/common';
import { CharacterSkillService } from './character-skill.service';
import { CharacterSkillResolver } from './character-skill.resolver';
import { CharacterSkill } from './entities/character-skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterSkill])],
  providers: [CharacterSkillResolver, CharacterSkillService],
})
export class CharacterSkillModule {}
