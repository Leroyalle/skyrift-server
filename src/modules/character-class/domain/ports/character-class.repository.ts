import type { CharacterClass } from '../entities/character-class.entity';

export interface CharacterClassRepositoryPort {
  findOne(id: string): Promise<CharacterClass | undefined>;
  create(domain: CharacterClass): Promise<CharacterClass>;
  findAll(): Promise<CharacterClass[]>;
  update(payload: CharacterClass): Promise<CharacterClass>;
  remove(id: string): Promise<void>;
}
