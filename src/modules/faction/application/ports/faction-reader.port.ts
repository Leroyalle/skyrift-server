import { Faction } from '../../domain/types/faction.type';

export interface FactionReaderPort {
  findById(id: string): Promise<Faction | null>;
  findAll(): Promise<Faction[]>;
}
