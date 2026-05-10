import { ICharacterClass } from '../../domain/types/character-class.type';

export interface CharacterClassFacadePort {
  create(payload: Omit<ICharacterClass, 'id'>): Promise<ICharacterClass>;
}
