import { Field, InputType, Int, PartialType } from '@nestjs/graphql';

import { CreateEffectInput } from './create-effect.input';

@InputType()
export class UpdateEffectInput extends PartialType(CreateEffectInput) {
  @Field(() => Int)
  id: number;
}
