import { Module } from '@nestjs/common';
import { FactionService } from './faction.service';
import { FactionResolver } from './faction.resolver';

@Module({
  providers: [FactionResolver, FactionService],
})
export class FactionModule {}
