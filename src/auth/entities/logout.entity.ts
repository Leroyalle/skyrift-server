import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Logout {
  @Field({ description: 'Сообщение о выходе' })
  message: string;
}
