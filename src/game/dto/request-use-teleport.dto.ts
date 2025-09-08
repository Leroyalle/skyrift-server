import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class RequestUseTeleportDto {
  @Field()
  teleportId: string;

  @Field(() => Int)
  pointerX: number;

  @Field(() => Int)
  pointerY: number;
}
