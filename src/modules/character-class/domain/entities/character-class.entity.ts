interface Props {
  id: string;
  name: string;
  description: string;
  logo: string;
  factionId: string;
  skillsIds: string[];
  // charactersIds: Character[];
}

export class CharacterClass {
  private constructor(private readonly props: Props) {}

  public static create(props: Props) {
    return new CharacterClass(props);
  }

  public snapshot(): Readonly<Props> {
    return this.props;
  }
}
