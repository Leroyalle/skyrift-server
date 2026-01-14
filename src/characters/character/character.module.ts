import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BagModule } from './bag/bag.module';
import { CharacterSkillModule } from './character-skill/character-skill.module';
import { CharacterResolver } from './character.resolver';
import { CharacterService } from './character.service';
import { Character } from './entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Character]), CharacterSkillModule, BagModule],
  providers: [CharacterResolver, CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
