import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCharacterClassInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
