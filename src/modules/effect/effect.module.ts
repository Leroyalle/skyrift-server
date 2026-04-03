import { Module } from '@nestjs/common';

import { EFFECT_PERSISTENCE_REPOSITORY_TOKEN } from './application/ports/tokens';
import { EffectPersistenceRepository } from './infrastructure/persistence/repositories/effect-persistence.repository';

@Module({
  providers: [
    {
      provide: EFFECT_PERSISTENCE_REPOSITORY_TOKEN,
      useClass: EffectPersistenceRepository,
    },
  ],
})
export class EffectModule {}
