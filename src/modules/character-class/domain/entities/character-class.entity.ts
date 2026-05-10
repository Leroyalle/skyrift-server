import { ICharacterClass } from '../types/character-class.type';
import type { ClassDescriptionVo } from '../vo/class-description.vo';

interface Props {
  id: string;
  name: string;
  description: ClassDescriptionVo;
  logo: string;
  factionId: string;
  skillsIds: string[];
}

export class CharacterClass {
  private constructor(private readonly props: Props) {}

  public static create(props: Props) {
    return new CharacterClass(props);
  }

  public snapshot(): Readonly<ICharacterClass> {
    return { ...this.props, description: this.props.description.getValue() };
  }
}
