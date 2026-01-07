import { Field, InputType, Int, PartialType } from '@nestjs/graphql';

import { CreateCharacterClassInput } from './create-character-class.input';

@InputType()
export class UpdateCharacterClassInput extends PartialType(CreateCharacterClassInput) {
  @Field(() => Int)
  id: number;
}
