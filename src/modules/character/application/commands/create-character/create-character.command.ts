import type { Appearance } from 'src/modules/character/domain/vo/appearance.vo';

interface Props {
  userId: string;
  classId: string;
  name: string;
  appearance: Appearance;
}

export class CreateCharacterCommand {
  constructor(public readonly props: Props) {}
}
