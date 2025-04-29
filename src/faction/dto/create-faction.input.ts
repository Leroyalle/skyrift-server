import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateFactionInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
