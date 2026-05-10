import { Module } from '@nestjs/common';

import { CombatModule } from '../combat/combat.module';
import { EffectModule } from '../effect/effect.module';
import { FlowModule } from '../flow/flow.module';
import { InteractionModule } from '../interaction/interaction.module';
import { MovementModule } from '../movement/movement.module';
import { RecoveryModule } from '../recovery/recovery.module';
import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';

import {
  SIMULATION_INTERVALS,
  SIMULATION_INTERVALS_TOKEN,
} from './application/config/simulation-intervals.config';
import { SimulationTickUseCase } from './application/use-cases/simulation-tick.use-case';
import { SimulationRunner } from './infrastructure/runner/simulation-runner.service';

@Module({
  imports: [
    MovementModule,
    RecoveryModule,
    InteractionModule,
    FlowModule,
    EffectModule,
    CombatModule,
  ],
  providers: [
    SimulationRunner,
    SimulationTickUseCase,
    { provide: SIMULATION_INTERVALS_TOKEN, useValue: SIMULATION_INTERVALS },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
})
export class SimulationModule {}
