import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { IS_DEV } from './common/lib/is-dev';
import { FactionModule } from './faction/faction.module';
import { CharacterClassModule } from './character-class/character-class.module';
import { ItemModule } from './item/item.module';
import { LocationModule } from './location/location.module';
import { SeedModule } from './seed/seed.module';
import { GameModule } from './game/game.module';
import { CharacterModule } from './character/character.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MobModule } from './mob/mob.module';
import { EffectModule } from './effect/effect.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { GraphqlModule } from './infrastructure/graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphqlModule,
    DatabaseModule,
    RedisModule,
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
  ],
})
export class AppModule {}
