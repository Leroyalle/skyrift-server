import { Faction } from '../types/faction.type';

export interface FactionPersistenceRepositoryPort {
  save(faction: Faction): Promise<Faction>;
  findAll(): Promise<Faction[]>;
  findById(id: string): Promise<Faction | null>;
  delete(id: string): Promise<void>;
}
