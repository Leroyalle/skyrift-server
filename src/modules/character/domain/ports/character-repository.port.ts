import type { Character } from '../entities/character.entity';

export interface CharacterRepositoryPort {
  create(payload: Character): Promise<Character>;
  findAll(): Promise<Character[]>;
  findUserCharacters(userId: string): Promise<Character[] | undefined>;
  findOwnedCharacter(userId: string, characterId: string): Promise<Character | undefined>;
  update(payload: Character): Promise<Character>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<Character | undefined>;
}
