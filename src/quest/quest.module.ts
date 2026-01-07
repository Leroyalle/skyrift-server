import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerQuest } from './entities/player-quest.entity';
import { Quest } from './entities/quest.entity';
import { QuestService } from './quest.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, PlayerQuest])],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule {}
