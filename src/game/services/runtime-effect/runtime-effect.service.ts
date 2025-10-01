import { Injectable } from '@nestjs/common';
import { IRuntimeEffect } from './types/runtime-effect.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';
import { RuntimeEntityService } from '../runtime-entity/runtime-entity.service';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { decodeEntityKey } from 'src/game/lib/entity/decode-entity-key.lib';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';
import { getOrCreateArray } from 'src/game/lib/helpers/get-or-create-array.lib';

@Injectable()
export class RuntimeEffectService {
  constructor(private readonly runtimeEntityService: RuntimeEntityService) {}

  private activeEffects: Map<EntityKey, Map<EffectType, IRuntimeEffect[]>> =
    new Map();

  public effectTick(): void {
    for (const [entityKey, effectsMap] of this.activeEffects.entries()) {
      const now = Date.now();
      const actualEffectsMap: Map<EffectType, IRuntimeEffect[]> = new Map();
      for (const [type, effects] of effectsMap.entries()) {
        const actualEffectsArray = getOrCreateArray<IRuntimeEffect>(
          actualEffectsMap,
          type,
        );
        effects.forEach((effect) => {
          if (effect.expiresAt > now) {
            if (now - effect.lastUsedAt >= 1000) {
              this.applyEffect(entityKey, effect);
            }
            actualEffectsArray.push(effect);
          }
        });
      }

      this.activeEffects.set(entityKey, actualEffectsMap);
    }
  }

  // FIXME: удалить в типе ентити эффекты
  // private removeEffect(entityRef: EntityRef) {}

  private applyEffect(
    entityKey: EntityKey,
    effect: IRuntimeEffect,
  ): TRuntimeEntity | undefined {
    const entityRef = decodeEntityKey(entityKey);
    const entity = this.runtimeEntityService.getEntityByType(
      entityRef.type,
      entityRef.id,
    );
    if (!entity) return;

    switch (effect.type) {
      case EffectType.Stun: {
      }
    }
    // const receivedDamage = effect.
  }
}
