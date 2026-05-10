import { CharacterCreateProps } from '../../types/character-create-props.type';

export class CreateCharacterCommand {
  constructor(public readonly props: CharacterCreateProps) {}
}
