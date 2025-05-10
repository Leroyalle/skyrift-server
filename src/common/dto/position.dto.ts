import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PositionDto {
  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;
}
