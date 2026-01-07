import { Field, InputType, Int, PartialType } from '@nestjs/graphql';

import { CreateSkillInput } from './create-skill.input';

@InputType()
export class UpdateSkillInput extends PartialType(CreateSkillInput) {
  @Field(() => Int)
  id: number;
}
