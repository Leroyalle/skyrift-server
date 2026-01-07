import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MobSpawn } from './entities/mob-spawn.entity';
import { NpcSpawn } from './entities/npc-spawn.entity';
import { SpawnService } from './spawn.service';

@Module({
  imports: [TypeOrmModule.forFeature([MobSpawn, NpcSpawn])],
  providers: [SpawnService],
  exports: [SpawnService],
})
export class SpawnModule {}
