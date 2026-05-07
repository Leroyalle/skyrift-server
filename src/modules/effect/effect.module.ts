import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EffectFacade } from './application/facades/effect.facade';
import {
  EFFECT_FACADE_TOKEN,
  EFFECT_PERSISTENCE_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { queries } from './application/queries/queries';
import { EffectOrmEntity } from './infrastructure/persistence/entities/effect-orm.entity';
import { EffectPersistenceRepository } from './infrastructure/persistence/repositories/effect-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EffectOrmEntity])],
  providers: [
    {
      provide: EFFECT_PERSISTENCE_REPOSITORY_TOKEN,
      useClass: EffectPersistenceRepository,
    },
    {
      provide: EFFECT_FACADE_TOKEN,
      useClass: EffectFacade,
    },
    ...queries,
  ],
  exports: [EFFECT_FACADE_TOKEN],
})
export class EffectModule {}
