import { Injectable } from '@nestjs/common';

import type { InteractionRepositoryPort } from '../../domain/ports/interaction-repository.port';
import type { Interaction } from '../../domain/types/interaction.type';

@Injectable()
export class InMemoryInteractionRepository implements InteractionRepositoryPort {
  private readonly interactions = new Map<string, Interaction>();

  public add(payload: Interaction) {
    this.interactions.set(payload.characterId, payload);
  }

  public delete(characterId: string) {
    this.interactions.delete(characterId);
  }

  public get(characterId: string) {
    return this.interactions.get(characterId);
  }

  public *getIterable() {
    yield* this.interactions.values();
  }
}
