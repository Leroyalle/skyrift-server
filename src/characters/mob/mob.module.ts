import { Module } from '@nestjs/common';
import { MobService } from './mob.service';
import { MobResolver } from './mob.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mob } from './entities/mob.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mob])],
  providers: [MobResolver, MobService],
  exports: [MobService],
})
export class MobModule {}
