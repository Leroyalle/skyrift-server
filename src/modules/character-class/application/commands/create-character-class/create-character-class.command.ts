interface Props {
  id: string;
  name: string;
  description: string;
  logo: string;
  factionId: string;
  skillsIds: string[];
}

export class CreateCharacterClassCommand {
  constructor(public readonly props: Props) {}
}
