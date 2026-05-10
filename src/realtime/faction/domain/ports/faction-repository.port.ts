import type { Faction } from '../types/faction.type';

export interface FactionRepositoryPort {
  set(faction: Faction): void;
  get(id: Faction['id']): Faction | undefined;
  getAll(): Iterable<Faction>;
  remove(id: Faction['id']): void;
}
