import { Module } from '@nestjs/common';

import { CombatModule } from '../combat/combat.module';
import { EntityRegistryModule } from '../entity-registry/entity-registry.module';
import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';

import { EFFECT_REPOSITORY_TOKEN, PROCESS_EFFECT_TICK_TOKEN } from './application/ports/tokens';
import { ProcessEffectTickUseCase } from './application/use-cases/process-effect-tick.use-case';
import { InMemoryEffectRepository } from './infrastructure/repositories/in-memory-effect.repository';

@Module({
  imports: [CombatModule, EntityRegistryModule],
  providers: [
    {
      provide: EFFECT_REPOSITORY_TOKEN,
      useClass: InMemoryEffectRepository,
    },
    {
      provide: PROCESS_EFFECT_TICK_TOKEN,
      useClass: ProcessEffectTickUseCase,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
  exports: [PROCESS_EFFECT_TICK_TOKEN],
})
export class EffectModule {}
