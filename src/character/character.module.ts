import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterResolver } from './character.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { CharacterSkillModule } from './character-skill/character-skill.module';

@Module({
  imports: [TypeOrmModule.forFeature([Character]), CharacterSkillModule],
  providers: [CharacterResolver, CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
