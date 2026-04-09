import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { decodeEntityKey } from 'src/realtime/shared/lib/helpers/decode-entity-key.helper';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';
import type { IEntityKey, IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';

import type { InMemoryEffectRepositoryPort } from '../../domain/ports/in-memory-effect-repository.port';
import type { EffectType, IEffect } from '../../domain/types/effect.type';

@Injectable()
export class InMemoryEffectRepository implements InMemoryEffectRepositoryPort {
  private readonly effects: Map<IEntityKey, Map<EffectType, IEffect[]>> = new Map();

  public add(entityRef: IEntityRef, effect: IEffect): void {
    const key = generateEntityKey(entityRef);
    const effectsByType = getOrCreate(this.effects, key, () => new Map<EffectType, IEffect[]>());
    const effectsArray = getOrCreate(effectsByType, effect.type, () => []);
    effectsArray.push(effect);
  }

  public get(ref: IEntityRef, type: EffectType): IEffect[] | null {
    const entityKey = generateEntityKey(ref);
    const ley = this.effects.get(entityKey);
    if (!ley) return null;
    return ley.get(type) ?? null;
  }

  public remove(ref: IEntityRef): void {
    this.effects.delete(generateEntityKey(ref));
  }

  public *getAll(): Iterable<{ entityRef: IEntityRef; type: EffectType; effects: IEffect[] }> {
    for (const [entityKey, effectsMap] of this.effects.entries()) {
      const entityRef = decodeEntityKey(entityKey);

      for (const [type, effects] of effectsMap.entries()) {
        yield { entityRef, effects, type };
      }
    }
  }

  public set(entityRef: IEntityRef, map: Map<EffectType, IEffect[]>): void {
    this.effects.set(generateEntityKey(entityRef), map);
  }
}
