import { Character } from '../entities/character.entity';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCharacterInput extends PartialType(Character) {
  @Field()
  id: string;
}
