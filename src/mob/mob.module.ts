import { Module } from '@nestjs/common';
import { MobService } from './mob.service';
import { MobResolver } from './mob.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mob } from './entities/mob.entity';
import { MobSpawnModule } from './mob-spawn/mob-spawn.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mob]), MobSpawnModule],
  providers: [MobResolver, MobService],
  exports: [MobService],
})
export class MobModule {}
