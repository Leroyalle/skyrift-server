import { CreateEffectInput } from './create-effect.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateEffectInput extends PartialType(CreateEffectInput) {
  @Field(() => Int)
  id: number;
}
