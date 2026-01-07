import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Mob } from './entities/mob.entity';
import { MobResolver } from './mob.resolver';
import { MobService } from './mob.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mob])],
  providers: [MobResolver, MobService],
  exports: [MobService],
})
export class MobModule {}
