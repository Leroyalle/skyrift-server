import { Module } from '@nestjs/common';
import { NpcService } from './npc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Npc } from './entities/npc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Npc])],
  providers: [NpcService],
  exports: [NpcService],
})
export class NpcModule {}
