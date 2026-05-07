import { Module } from '@nestjs/common';

import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';

import { GET_PING_USE_CASE_TOKEN } from './application/ports/tokens';
import { GetPingUseCase } from './application/use-cases/get-ping.use-case';

@Module({
  providers: [
    {
      provide: GET_PING_USE_CASE_TOKEN,
      useClass: GetPingUseCase,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
  exports: [GET_PING_USE_CASE_TOKEN],
})
export class ConnectionStatsModule {}
