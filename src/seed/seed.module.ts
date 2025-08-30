import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';
import { Faction } from 'src/faction/entities/faction.entity';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { Character } from 'src/character/entities/character.entity';
import { Skill } from 'src/character-class/skill/entities/skill.entity';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Location,
      Faction,
      CharacterClass,
      Character,
      Skill,
      CharacterSkill,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
