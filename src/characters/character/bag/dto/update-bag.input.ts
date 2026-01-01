import { CreateBagInput } from './create-bag.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateBagInput extends PartialType(CreateBagInput) {
  @Field(() => Int)
  id: number;
}
