import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCharacterInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
