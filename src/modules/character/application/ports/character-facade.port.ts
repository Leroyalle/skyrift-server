import type { CharacterSnapshot } from '../../domain/types/character.type';
import { CharacterCreateProps } from '../types/character-create-props.type';

export interface CharacterFacadePort {
  findById(userId: string, characterId: string): Promise<CharacterSnapshot | null>;
  create(character: CharacterCreateProps): Promise<CharacterSnapshot>;
  update(id: CharacterSnapshot['id'], payload: Omit<CharacterSnapshot, 'id'>): Promise<void>;
  delete(characterId: string): Promise<void>;
}
