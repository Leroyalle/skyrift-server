import { Module } from '@nestjs/common';

import { LocationModule } from './location/location.module';
import { SpawnModule } from './spawn/spawn.module';

@Module({
  imports: [LocationModule, SpawnModule],
})
export class WorldModule {}
