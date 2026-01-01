import { Module } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestResolver } from './quest.resolver';

@Module({
  providers: [QuestResolver, QuestService],
})
export class QuestModule {}
