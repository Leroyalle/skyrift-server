import { Field, InputType, Int, PartialType } from '@nestjs/graphql';

import { CreateBagInput } from './create-bag.input';

@InputType()
export class UpdateBagInput extends PartialType(CreateBagInput) {
  @Field(() => Int)
  id: number;
}
