import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import type { IEntityKey, IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';

import type { InMemoryEffectRepositoryPort } from '../../domain/ports/in-memory-effect-repository.port';
import type { IEffect } from '../../domain/types/effect.type';

@Injectable()
export class InMemoryEffectRepository implements InMemoryEffectRepositoryPort {
  private readonly effects: Map<IEntityKey, IEffect> = new Map();

  public set(entityRef: IEntityRef, effect: IEffect): void {
    const key = generateEntityKey(entityRef);
    this.effects.set(key, effect);
  }

  public get(id: IEntityKey): IEffect | null {
    return this.effects.get(id) ?? null;
  }

  public remove(id: IEntityKey): void {
    this.effects.delete(id);
  }
}
