import { CreateMobSpawnInput } from './create-mob-spawn.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMobSpawnInput extends PartialType(CreateMobSpawnInput) {
  @Field(() => Int)
  id: number;
}
