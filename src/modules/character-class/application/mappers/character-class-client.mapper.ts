import type { CharacterClass } from '../../domain/entities/character-class.entity';

interface CharacterClassClientDto {
  id: string;
  name: string;
  description: string;
  logo: string;
  factionId: string;
  skillsIds: string[];
}

export class CharacterClassClientMapper {
  public static toClient = (characterClass: CharacterClass): CharacterClassClientDto => {
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
