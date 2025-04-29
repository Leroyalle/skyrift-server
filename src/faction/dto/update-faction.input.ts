import { CreateFactionInput } from './create-faction.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFactionInput extends PartialType(CreateFactionInput) {
  @Field(() => Int)
  id: number;
}
