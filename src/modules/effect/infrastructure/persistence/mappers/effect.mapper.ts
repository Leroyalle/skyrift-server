import { Effect } from 'src/modules/effect/domain/entities/effect.entity';

import type { EffectOrmEntity } from '../entities/effect-orm.entity';

export class EffectMapper {
  public static toDomain = (payload: EffectOrmEntity): Effect => {
    return Effect.create({
      durationMs: payload.durationMs,
      id: payload.id,
      skillId: payload.skillId,
      type: payload.type,
      amount: payload.amount,
      slowPercent: payload.slowPercent,
      damagePerSecond: payload.damagePerSecond,
    });
  };

  public static toPersistence = (payload: Effect): EffectOrmEntity => {
    const snapshot = payload.snapshot();

    return {
      slowPercent: snapshot.slowPercent,
      amount: snapshot.amount,
      damagePerSecond: snapshot.damagePerSecond,
      durationMs: snapshot.durationMs,
      id: snapshot.id,
      skillId: snapshot.skillId,
      type: snapshot.type,
    };
  };
}
