import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogoutModel {
  @Field({ description: 'Сообщение о выходе' })
  message!: string;
}
