import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMobSpawnInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
