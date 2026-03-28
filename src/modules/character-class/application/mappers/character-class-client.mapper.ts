import type { CharacterClass } from '../../domain/entities/character-class.entity';

export class CharacterClassClientMapper {
  public static toClient = (characterClass: CharacterClass) => {
    const snapshot = characterClass.snapshot();
    return {
      id: snapshot.id,
      name: snapshot.name,
      description: snapshot.description.getValue(),
      logo: snapshot.logo,
      factionId: snapshot.factionId,
      skillsIds: snapshot.skillsIds,
    };
  };
}
