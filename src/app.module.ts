import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FactionModule } from './faction/faction.module';
import { CharacterClassModule } from './character-class/character-class.module';
import { ItemModule } from './item/item.module';
import { LocationModule } from './world/location/location.module';
import { SeedModule } from './seed/seed.module';
import { GameModule } from './game/game.module';
import { CharacterModule } from './characters/character/character.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MobModule } from './characters/mob/mob.module';
import { EffectModule } from './effect/effect.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { GraphqlModule } from './infrastructure/graphql/graphql.module';
import { NpcModule } from './characters/npc/npc.module';
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
    LocationModule,
    SeedModule,
    GameModule,
    MobModule,
    EffectModule,
    NpcModule,
    WorldModule,
  ],
})
export class AppModule {}
