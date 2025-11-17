import { Injectable } from '@nestjs/common';
import { IRuntimeEffect } from './types/runtime-effect.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';
import { RuntimeEntityService } from '../runtime-entity/runtime-entity.service';
import { decodeEntityKey } from 'src/game/lib/entity/decode-entity-key.lib';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';
import { getOrCreateArray } from 'src/game/lib/helpers/get-or-create-array.lib';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { ActionType } from 'src/game/types/pending-actions.type';
import { SocketService } from '../socket/socket.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { Effect } from 'src/effect/entities/effect.entity';
import { buildRuntimeEffect } from './lib/build-runtime-effect.lib';
import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { BaseLogger } from 'src/common/infra/logger.infra';

@Injectable()
export class RuntimeEffectService extends BaseLogger {
  constructor(
    private readonly runtimeEntityService: RuntimeEntityService,
    private readonly socketService: SocketService,
  ) {
    super();
  }

  private activeEffects: Map<EntityKey, Map<EffectType, IRuntimeEffect[]>> =
    new Map();

  public effectTick(): void {
    const batchUpdateEffects: Map<string, BatchUpdateAction[]> = new Map();
    for (const [entityKey, effectsMap] of this.activeEffects.entries()) {
      console.log('[EFFECT_TICK]', Array.from(this.activeEffects.values())[0]);
      const now = Date.now();

      const entityRef = decodeEntityKey(entityKey);
      const entity = this.runtimeEntityService.getEntityByType(
        entityRef.type,
        entityRef.id,
      );
      if (!entity) continue;

      const batchUpdate = getOrCreateArray<BatchUpdateAction>(
        batchUpdateEffects,
        entity.locationId,
      );

      const actualEffectsMap: Map<EffectType, IRuntimeEffect[]> = new Map();
      for (const [type, effects] of effectsMap.entries()) {
        const actualEffectsArray = getOrCreateArray<IRuntimeEffect>(
          actualEffectsMap,
          type,
        );
        effects.forEach((effect) => {
          // TODO: слать запррос что эффект снят
          if (effect.expiresAt > now) {
            this.log('before apply effect');
            const effectResult = this.applyEffect(entityKey, effect, now);
            if (effectResult) {
              batchUpdate.push(effectResult);
            }
            // TODO: нужно добваить множество кейсов в эпли эффект и перенести пуш актуальных эффектов выше
            actualEffectsArray.push(effect);
          }
        });
      }

      this.activeEffects.set(entityKey, actualEffectsMap);
    }

    for (const [locationId, update] of batchUpdateEffects.entries()) {
      this.socketService.sendTo(
        RedisKeysFactory.locationPrefix + locationId,
        ServerToClientEvents.EntityStateUpdate,
        update,
      );
    }
  }

  public addEffect(entityRef: EntityRef, effect: Effect): void {
    this.log('addEffect');
    const runtimeEffect: IRuntimeEffect = buildRuntimeEffect(effect);
    const effectsMap = this.findOrCreateMap(entityRef);
    const effectsArray = getOrCreateArray(effectsMap, effect.type);
    effectsArray.push(runtimeEffect);
    const entityKey = generateEntityKey(entityRef);

    this.activeEffects.set(entityKey, effectsMap);
  }

  public findByType(
    entityRef: EntityRef,
    type: EffectType,
  ): IRuntimeEffect[] | undefined {
    const map = this.activeEffects.get(generateEntityKey(entityRef));
    if (!map) return;
    console.log('FINDBYMAP', Boolean(map));
    return map.get(type);
  }

  private findOrCreateMap(
    entityRef: EntityRef,
  ): Map<EffectType, IRuntimeEffect[]> {
    const entityKey = generateEntityKey(entityRef);
    const effectsMap =
      this.activeEffects.get(entityKey) ??
      new Map<EffectType, IRuntimeEffect[]>();
    return effectsMap;
  }

  // FIXME: удалить в типе ентити эффекты
  // private removeEffect(entityRef: EntityRef) {}

  private applyEffect(
    entityKey: EntityKey,
    effect: IRuntimeEffect,
    now: number = Date.now(),
  ): BatchUpdateAction | undefined {
    if (now - effect.lastUsedAt < 1000) return;

    this.log('applyEffect');

    const entityRef = decodeEntityKey(entityKey);
    const entity = this.runtimeEntityService.getEntityByType(
      entityRef.type,
      entityRef.id,
    );

    if (!entity) return;

    switch (effect.type) {
      case EffectType.DamageOverTime: {
        if (!effect.damagePerSecond) return;
        const receivedDamage = effect.damagePerSecond;
        const remainedHp = Math.max(entity.hp - receivedDamage, 0);

        entity.hp = remainedHp;
        entity.isAlive = remainedHp > 0;
        effect.lastUsedAt = now;
        return {
          type: ActionType.Effect,
          skillId: null,
          targets: [
            {
              hp: entity.hp,
              id: entity.id,
              type: entity.type,
              isAlive: entity.isAlive,
              receivedDamage,
              appliedEffects: [
                {
                  effectType: EffectType.DamageOverTime,
                  durationMs: effect.expiresAt - now,
                  expiresAt: effect.expiresAt,
                  magnitude: effect.damagePerSecond,
                },
              ],
            },
          ],
        };
      }
    }
  }
}
