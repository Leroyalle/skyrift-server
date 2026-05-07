import { BagModule } from 'src/modules/bag/bag.module';
import { CharacterClassModule } from 'src/modules/character-class/character-class.module';
import { CharacterModule } from 'src/modules/character/character.module';
import { EffectModule } from 'src/modules/effect/effect.module';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';
import { FactionModule } from 'src/modules/faction/faction.module';
import { ItemModule } from 'src/modules/item/item.module';
import { LocationModule } from 'src/modules/location/location.module';
import { MobModule } from 'src/modules/mob/mob.module';
import { NpcModule } from 'src/modules/npc/npc.module';
import { OwnedSkillModule } from 'src/modules/owned-skill/owned-skill.module';
import { QuestModule } from 'src/modules/quest/quest.module';
import { SkillModule } from 'src/modules/skill/skill.module';
import { SpawnModule } from 'src/modules/spawn/spawn.module';
import { UserModule } from 'src/modules/user/user.module';

import { Module } from '@nestjs/common';

import { SeedService } from './seed.service';

@Module({
  imports: [
    CharacterModule,
    CharacterClassModule,
    EffectModule,
    EquipmentModule,
    FactionModule,
    ItemModule,
    LocationModule,
    MobModule,
    NpcModule,
    OwnedSkillModule,
    QuestModule,
    SkillModule,
    SpawnModule,
    UserModule,
    BagModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
