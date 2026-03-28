interface CharacterClassDto {
  id: string;
  name: string;
  description: string;
  logo: string;
  factionId: string;
  skillsIds: string[];
}

export interface CharacterClassReaderPort {
  findById(id: string): Promise<CharacterClassDto | null>;
  findAll(id: string): Promise<CharacterClassDto | null>;
}
