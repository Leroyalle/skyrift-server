import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateEffectInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
