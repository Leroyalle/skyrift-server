import { Module } from '@nestjs/common';
import { PathFindingService } from './path-finding.service';

@Module({
  providers: [PathFindingService],
  exports: [PathFindingService],
})
export class PathFindingModule {}
