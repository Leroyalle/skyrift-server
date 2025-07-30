import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';

// FIXME: deprecated, need change to just x & y

@ObjectType('PositionOutput')
@InputType('PositionInput')
export class PositionDto {
  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;
}
