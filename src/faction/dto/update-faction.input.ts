import { Field, InputType, Int, PartialType } from '@nestjs/graphql';

import { CreateFactionInput } from './create-faction.input';

@InputType()
export class UpdateFactionInput extends PartialType(CreateFactionInput) {
  @Field(() => Int)
  id: number;
}
