import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class DirectMessageInput {
  @Field(() => ID)
  recipientId: string;

  @Field()
  message: string;
}
