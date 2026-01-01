import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/world/location/entities/location.entity';
import { Faction } from 'src/faction/entities/faction.entity';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { Character } from 'src/characters/character/entities/character.entity';
import { Skill } from 'src/character-class/skill/entities/skill.entity';
import { CharacterSkill } from 'src/characters/character/character-skill/entities/character-skill.entity';
import { Mob } from 'src/characters/mob/entities/mob.entity';
import { MobSpawn } from 'src/world/spawn/entities/mob-spawn.entity';
import { Effect } from 'src/effect/entities/effect.entity';
import { ItemModule } from 'src/item/item.module';
import { QuestModule } from 'src/quest/quest.module';
import { NpcModule } from 'src/characters/npc/npc.module';
import { MobModule } from 'src/characters/mob/mob.module';
import { SpawnModule } from 'src/world/spawn/spawn.module';

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
      Mob,
      MobSpawn,
      Effect,
    ]),
    ItemModule,
    QuestModule,
    NpcModule,
    MobModule,
    SpawnModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
