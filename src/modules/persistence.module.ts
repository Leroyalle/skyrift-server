import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { BagModule } from './bag/bag.module';
import { CharacterClassModule } from './character-class/character-class.module';
import { CharacterModule } from './character/character.module';
import { EffectModule } from './effect/effect.module';
import { EquipmentModule } from './equipment/equipment.module';
import { FactionModule } from './faction/faction.module';
import { ItemModule } from './item/item.module';
import { LocationModule } from './location/location.module';
import { MobModule } from './mob/mob.module';
import { NpcModule } from './npc/npc.module';
import { OwnedSkillModule } from './owned-skill/owned-skill.module';
import { QuestModule } from './quest/quest.module';
import { SkillModule } from './skill/skill.module';
import { SpawnModule } from './spawn/spawn.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    BagModule,
    CharacterModule,
    CharacterClassModule,
    EffectModule,
    EquipmentModule,
    ItemModule,
    LocationModule,
    MobModule,
    NpcModule,
    OwnedSkillModule,
    QuestModule,
    SkillModule,
    SpawnModule,
    AuthModule,
    UserModule,
    FactionModule,
  ],
})
export class PersistenceModule {}
