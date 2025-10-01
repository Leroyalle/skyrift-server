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

@Injectable()
export class RuntimeEffectService {
  constructor(
    private readonly runtimeEntityService: RuntimeEntityService,
    private readonly socketService: SocketService,
  ) {}

  private activeEffects: Map<EntityKey, Map<EffectType, IRuntimeEffect[]>> =
    new Map();

  public effectTick(): void {
    const batchUpdateEffects: Map<string, BatchUpdateAction[]> = new Map();
    for (const [entityKey, effectsMap] of this.activeEffects.entries()) {
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
            const effectResult = this.applyEffect(entityKey, effect, now);
            if (!effectResult) return;
            batchUpdate.push(effectResult);
            actualEffectsArray.push(effect);
          }
        });
      }

      this.activeEffects.set(entityKey, actualEffectsMap);
    }

    for (const [locationId, update] of batchUpdateEffects.entries()) {
      this.socketService.sendTo(
        RedisKeysFactory.locationPrefix + locationId,
        ServerToClientEvents.PlayerStateUpdate,
        update,
      );
    }
  }

  public addEffect(entityRef: EntityRef, effect: Effect): void {
    const runtimeEffect: IRuntimeEffect = buildRuntimeEffect(effect);
    const entityKey = generateEntityKey(entityRef);
    const effectsMap =
      this.activeEffects.get(entityKey) ??
      new Map<EffectType, IRuntimeEffect[]>();
    const effectsArray = getOrCreateArray(effectsMap, effect.type);
    effectsArray.push(runtimeEffect);
  }

  // FIXME: удалить в типе ентити эффекты
  // private removeEffect(entityRef: EntityRef) {}

  private applyEffect(
    entityKey: EntityKey,
    effect: IRuntimeEffect,
    now: number = Date.now(),
  ): BatchUpdateAction | undefined {
    if (now - effect.lastUsedAt < 1000) return;

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
