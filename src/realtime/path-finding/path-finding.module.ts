import { Module } from '@nestjs/common';

import { PATH_FINDING_SERVICE } from './application/ports';
import { PathFindingService } from './infrastructure/services/path-finding.service';

@Module({
  providers: [
    {
      provide: PATH_FINDING_SERVICE,
      useClass: PathFindingService,
    },
  ],
  exports: [PATH_FINDING_SERVICE],
})
export class PathFindingModule {}
