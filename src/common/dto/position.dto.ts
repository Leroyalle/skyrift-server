import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PositionOutput')
@InputType('PositionInput')
export class PositionDto {
  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;
}
