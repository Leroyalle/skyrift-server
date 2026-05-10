import { Module } from '@nestjs/common';

import { SPATIAL_GRID_INDEX_TOKEN } from './application/ports/tokens';
import { SpatialGridIndexService } from './infrastructure/services/spatial-grid-index/spatial-grid-index.service';

@Module({
  providers: [
    {
      provide: SPATIAL_GRID_INDEX_TOKEN,
      useClass: SpatialGridIndexService,
    },
  ],
  exports: [SPATIAL_GRID_INDEX_TOKEN],
})
export class SpatialGridModule {}
