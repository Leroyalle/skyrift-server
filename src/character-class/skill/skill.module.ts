import { CharacterSkill } from 'src/characters/character/character-skill/entities/character-skill.entity';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SkillResolver } from './skill.resolver';
import { SkillService } from './skill.service';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterSkill])],
  providers: [SkillResolver, SkillService],
})
export class SkillModule {}
