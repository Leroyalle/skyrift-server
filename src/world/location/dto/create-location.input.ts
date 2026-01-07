import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateLocationInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
