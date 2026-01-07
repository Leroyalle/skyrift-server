import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { CharacterClassModule } from './character-class/character-class.module';
import { CharacterModule } from './characters/character/character.module';
import { MobModule } from './characters/mob/mob.module';
import { NpcModule } from './characters/npc/npc.module';
import { EffectModule } from './effect/effect.module';
import { FactionModule } from './faction/faction.module';
import { GameModule } from './game/game.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { GraphqlModule } from './infrastructure/graphql/graphql.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { ItemModule } from './item/item.module';
import { QuestModule } from './quest/quest.module';
import { SeedModule } from './seed/seed.module';
import { UserModule } from './user/user.module';
import { WorldModule } from './world/world.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphqlModule,
    DatabaseModule,
    RedisModule,
    WorldModule,
    UserModule,
    AuthModule,
    FactionModule,
    CharacterModule,
    CharacterClassModule,
    ItemModule,
    SeedModule,
    GameModule,
    MobModule,
    EffectModule,
    NpcModule,
    WorldModule,
    QuestModule,
  ],
})
export class AppModule {}
