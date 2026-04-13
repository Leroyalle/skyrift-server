import type { CharacterSnapshot } from '../../domain/types/character.type';

export interface CharacterFacadePort {
  findById(userId: string, characterId: string): Promise<CharacterSnapshot | null>;
}
