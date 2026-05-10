import { CharacterWithClassDto } from '../../application/ports/find-user-characters-with-class.port';
import { CharacterModel } from '../models/character.model';

export class CharacterPresentationMapper {
  public static toModel = (payload: CharacterWithClassDto): CharacterModel => {
    return {
      appearance: payload.character.appearance,
      id: payload.character.id,
      isDeleted: payload.character.isDeleted,
      level: payload.character.level,
      name: payload.character.name,
      characterClass: {
        faction: {
          id: '1',
          name: 'Human',
        },
        id: payload.characterClass.id,
        name: payload.characterClass.name,
      },
    };
  };
}
