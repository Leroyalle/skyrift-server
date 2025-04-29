import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field({ description: 'Access token' })
  accessToken: string;

  @Field({ description: 'RefreshToken token' })
  refreshToken: string;
}
