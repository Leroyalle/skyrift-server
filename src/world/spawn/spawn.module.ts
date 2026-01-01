import { Module } from '@nestjs/common';
import { SpawnService } from './spawn.service';
import { MobSpawn } from './entities/mob-spawn.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NpcSpawn } from './entities/npc-spawn.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MobSpawn, NpcSpawn])],
  providers: [SpawnService],
})
export class SpawnModule {}
