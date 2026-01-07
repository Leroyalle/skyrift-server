import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Npc } from './entities/npc.entity';
import { NpcService } from './npc.service';

@Module({
  imports: [TypeOrmModule.forFeature([Npc])],
  providers: [NpcService],
  exports: [NpcService],
})
export class NpcModule {}
