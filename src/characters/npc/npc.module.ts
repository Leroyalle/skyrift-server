import { Module } from '@nestjs/common';
import { NpcService } from './npc.service';

@Module({
  providers: [NpcService],
  exports: [NpcService],
})
export class NpcModule {}
