import { CreateMobInput } from './create-mob.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMobInput extends PartialType(CreateMobInput) {
  @Field(() => Int)
  id: number;
}
