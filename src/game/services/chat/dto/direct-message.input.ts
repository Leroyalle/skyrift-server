import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DirectMessageInput {
  @Field()
  recipientName: string;

  @Field()
  message: string;
}
