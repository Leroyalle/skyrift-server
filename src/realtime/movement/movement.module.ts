import { SocketModule } from 'src/infrastructure/ws/socket.module';

import { Module } from '@nestjs/common';

import { EntityRegistryModule } from '../entity-registry/entity-registry.module';
import { PathFindingModule } from '../path-finding/path-finding.module';
import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';
import { SpatialGridModule } from '../spatial-grid/spatial-grid.module';

import { MovementQueueFacade } from './application/facades/movement-queue.facade';
import { MovementQueueReader } from './application/facades/movement-queue.reader';
import {
  APPROACH_TARGET_SERVICE_TOKEN,
  IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY,
  MOVEMENT_QUEUE_FACADE_TOKEN,
  MOVEMENT_QUEUE_READER_TOKEN,
  PLAN_MOVEMENT_USE_CASE_TOKEN,
  PROCESS_MOVEMENT_TICK_TOKEN,
} from './application/ports/tokens';
import { ApproachTargetService } from './application/services/approach-target.service';
import { PlanMovementUseCase } from './application/use-cases/plan-movement.use-case';
import { ProcessMovementTickUseCase } from './application/use-cases/process-movement-tick.use-case';
import { InMemoryMovementQueueRepository } from './infrastructure/repositories/in-memory-movement-queue.repository';

@Module({
  imports: [PathFindingModule, SpatialGridModule, SocketModule, EntityRegistryModule],
  providers: [
    {
      provide: IN_MEMORY_MOVEMENT_QUEUE_REPOSITORY,
      useClass: InMemoryMovementQueueRepository,
    },
    {
      provide: MOVEMENT_QUEUE_FACADE_TOKEN,
      useClass: MovementQueueFacade,
    },
    {
      provide: PLAN_MOVEMENT_USE_CASE_TOKEN,
      useClass: PlanMovementUseCase,
    },
    {
      provide: APPROACH_TARGET_SERVICE_TOKEN,
      useClass: ApproachTargetService,
    },
    {
      provide: PROCESS_MOVEMENT_TICK_TOKEN,
      useClass: ProcessMovementTickUseCase,
    },
    {
      provide: MOVEMENT_QUEUE_READER_TOKEN,
      useClass: MovementQueueReader,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
  exports: [
    MOVEMENT_QUEUE_FACADE_TOKEN,
    PLAN_MOVEMENT_USE_CASE_TOKEN,
    APPROACH_TARGET_SERVICE_TOKEN,
    PROCESS_MOVEMENT_TICK_TOKEN,
    MOVEMENT_QUEUE_READER_TOKEN,
  ],
})
export class MovementModule {}
