import { RedisModule } from 'src/infrastructure/redis/redis.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location } from './entities/location.entity';
import { LocationResolver } from './location.resolver';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), RedisModule],
  providers: [LocationResolver, LocationService],
  exports: [LocationService],
})
export class LocationModule {}
