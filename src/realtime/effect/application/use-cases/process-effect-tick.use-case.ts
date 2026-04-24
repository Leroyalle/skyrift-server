import type { BatchUpdateAction } from 'src/realtime/combat';
import type { ApplyEffectImpactFacadePort } from 'src/realtime/combat/application/ports/apply-effect-impact-facade.port';
import { APPLY_EFFECT_IMPACT_FACADE_TOKEN } from 'src/realtime/combat/application/ports/tokens';
import {
  ENTITY_RESOLVER_TOKEN,
  type EntityResolverPort,
  type EntitySnapshot,
} from 'src/realtime/entity-registry';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryEffectRepositoryPort } from '../../domain/ports/in-memory-effect-repository.port';
import type { EffectType, IEffect } from '../../domain/types/effect.type';
import type { ProcessEffectTickPort } from '../ports/process-effect-tick.port';
import { EFFECT_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class ProcessEffectTickUseCase implements ProcessEffectTickPort {
  constructor(
    @Inject(EFFECT_REPOSITORY_TOKEN)
    private readonly effectRepository: InMemoryEffectRepositoryPort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(APPLY_EFFECT_IMPACT_FACADE_TOKEN)
    private readonly applyEffectImpactFacade: ApplyEffectImpactFacadePort,
  ) {}

  public execute() {
    const batchUpdateEffects: Map<string, BatchUpdateAction[]> = new Map();

    for (const { entityRef, effects } of this.effectRepository.getAll()) {
      const now = this.clockService.nowMs();

      const entity = this.entityResolver.getByRef(entityRef);

      if (!entity) {
        this.effectRepository.remove(entityRef);
        continue;
      }

      const batchUpdate = getOrCreate(batchUpdateEffects, entity.position.locationId, () => []);

      const actualEffectsMap: Map<EffectType, IEffect[]> = new Map();

      effects.forEach(effect => {
        const actualEffectsArray = getOrCreate(actualEffectsMap, effect.type, () => []);

        if (effect.expiresAt > now) {
          const result = this.applyEffect(entity, effect, now);
          if (result) {
            batchUpdate.push(result);
          }
          actualEffectsArray.push(effect);
        }
      });

      this.effectRepository.set(entityRef, actualEffectsMap);
    }
  }

  public applyEffect(
    target: EntitySnapshot,
    effect: IEffect,
    now: number,
  ): BatchUpdateAction | undefined {
    if (effect.type !== 'damage_over_time') return;
    const result = this.applyEffectImpactFacade.execute({
      attackerRef: effect.attackerRef,
      magnitude: effect.magnitude || 0,
      target: target,
      skillId: effect.type,
      effectType: effect.type,
      occurredAt: now,
    });

    if (!result) return;

    return {
      type: 'effect',
      skillId: null,
      targets: [
        {
          hp: result.hp,
          id: target.id,
          type: target.type,
          isAlive: result.isAlive,
          receivedDamage: result.damage,
          appliedEffects: [
            {
              effectType: 'damage_over_time',
              durationMs: effect.expiresAt - now,
              expiresAt: effect.expiresAt,
              magnitude: effect.magnitude,
            },
          ],
        },
      ],
    };
  }
}
