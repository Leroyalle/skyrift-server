import { CharacterClassDto } from 'src/modules/character-class';

import { CharacterSnapshot } from '../../domain/types/character.type';

export interface FindUserCharactersWithClassPort {
  execute(userId: string): Promise<CharacterWithClassDto[]>;
}

export interface CharacterWithClassDto {
  character: CharacterSnapshot;
  characterClass: CharacterClassDto;
}
