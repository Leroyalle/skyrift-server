import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';
import { LocationLayer } from 'src/location/entities/location-layer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Location, LocationLayer])],
  providers: [SeedService],
})
export class SeedModule {}
