import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMobInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
