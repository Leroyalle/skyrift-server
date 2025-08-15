import { CreateCharacterSkillInput } from './create-character-skill.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCharacterSkillInput extends PartialType(CreateCharacterSkillInput) {
  @Field(() => Int)
  id: number;
}
