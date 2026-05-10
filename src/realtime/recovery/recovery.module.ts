import { SocketModule } from 'src/infrastructure/ws/socket.module';

import { Module } from '@nestjs/common';

import { EntityRegistryModule } from '../entity-registry/entity-registry.module';
import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';

import { PROCESS_RECOVERY_TICK_TOKEN } from './application/ports/tokens';
import { ProcessRecoveryTickUseCase } from './application/use-cases/process-recovery-tick.use-case';

@Module({
  imports: [EntityRegistryModule, SocketModule],
  providers: [
    { provide: PROCESS_RECOVERY_TICK_TOKEN, useClass: ProcessRecoveryTickUseCase },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
  exports: [PROCESS_RECOVERY_TICK_TOKEN],
})
export class RecoveryModule {}
