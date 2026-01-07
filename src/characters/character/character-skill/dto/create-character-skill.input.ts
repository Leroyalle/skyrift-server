import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCharacterSkillInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
