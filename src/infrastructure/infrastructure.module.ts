import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { GraphqlModule } from './graphql/graphql.module';
import { RedisModule } from './redis/redis.module';
import { SocketModule } from './ws/socket.module';

@Module({
  imports: [DatabaseModule, GraphqlModule, RedisModule, SocketModule],
})
export class InfrastructureModule {}
