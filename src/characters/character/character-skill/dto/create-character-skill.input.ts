import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCharacterSkillInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
