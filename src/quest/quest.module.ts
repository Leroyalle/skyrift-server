import { Module } from '@nestjs/common';
import { QuestService } from './quest.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from './entities/quest.entity';
import { PlayerQuest } from './entities/player-quest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, PlayerQuest])],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule {}
