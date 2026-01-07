import { Field, InputType, Int, PartialType } from '@nestjs/graphql';

import { CreateMobInput } from './create-mob.input';

@InputType()
export class UpdateMobInput extends PartialType(CreateMobInput) {
  @Field(() => Int)
  id: number;
}
