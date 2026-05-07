import { Faction } from '../../domain/types/faction.type';

export interface FactionFacadePort {
  create(faction: Omit<Faction, 'id'>): Promise<Faction>;
  delete(id: string): Promise<void>;
}
