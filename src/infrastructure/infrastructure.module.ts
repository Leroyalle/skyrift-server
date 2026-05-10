import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { GraphqlModule } from './graphql/graphql.module';
import { RedisModule } from './redis/redis.module';
import { SeedModule } from './seed/seed.module';
import { SocketModule } from './ws/socket.module';

@Module({
  imports: [DatabaseModule, GraphqlModule, RedisModule, SocketModule, SeedModule],
})
export class InfrastructureModule {}
