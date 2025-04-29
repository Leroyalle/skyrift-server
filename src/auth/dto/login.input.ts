import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field({ description: 'Email пользователя' })
  email: string;

  @Field({ description: 'Password пользователя' })
  password: string;
}
