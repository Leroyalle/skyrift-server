import { Character } from '../entities/character.entity';
import { CreateCharacterInput } from './create-character.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCharacterInput extends PartialType(Character) {}
