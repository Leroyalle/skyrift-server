import { Injectable } from '@nestjs/common';

import type { FactionRepositoryPort } from '../../domain/ports/faction-repository.port';
import type { Faction } from '../../domain/types/faction.type';

@Injectable()
export class InMemoryFactionRepository implements FactionRepositoryPort {
  private readonly factions = new Map<string, Faction>();

  public set(faction: Faction) {
    this.factions.set(faction.id, faction);
  }

  public get(id: Faction['id']): Faction | undefined {
    return this.factions.get(id);
  }

  public getAll(): Iterable<Faction> {
    return this.factions.values();
  }

  public remove(id: Faction['id']): void {
    this.factions.delete(id);
  }
}
