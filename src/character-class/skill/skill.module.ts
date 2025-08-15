import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillResolver } from './skill.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterSkill])],
  providers: [SkillResolver, SkillService],
})
export class SkillModule {}
