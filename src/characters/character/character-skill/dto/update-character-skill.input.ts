import { Field, InputType, Int, PartialType } from '@nestjs/graphql';

import { CreateCharacterSkillInput } from './create-character-skill.input';

@InputType()
export class UpdateCharacterSkillInput extends PartialType(CreateCharacterSkillInput) {
  @Field(() => Int)
  id: number;
}
