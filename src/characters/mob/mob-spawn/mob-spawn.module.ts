import { Module } from '@nestjs/common';
import { MobSpawnService } from './mob-spawn.service';
import { MobSpawnResolver } from './mob-spawn.resolver';

@Module({
  providers: [MobSpawnResolver, MobSpawnService],
  exports: [MobSpawnService],
})
export class MobSpawnModule {}
