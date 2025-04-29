import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field({ description: 'Имя пользователя' })
  name: string;

  @Field({ description: 'Email пользователя' })
  email: string;

  @Field({ description: 'Password пользователя' })
  password: string;
}
