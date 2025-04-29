import { CreateCharacterClassInput } from './create-character-class.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCharacterClassInput extends PartialType(CreateCharacterClassInput) {
  @Field(() => Int)
  id: number;
}
