import { Field, InputType, PartialType } from '@nestjs/graphql';

import { Character } from '../entities/character.entity';

@InputType()
export class UpdateCharacterInput extends PartialType(Character) {
  @Field()
  id: string;
}
