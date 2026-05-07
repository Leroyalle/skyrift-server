import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class AppearanceModel {
  @Field()
  head!: string;

  @Field()
  body!: string;
}

@ObjectType()
export class FactionModel {
  @Field()
  id!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class CharacterClassModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => FactionModel)
  faction!: FactionModel;
}

@ObjectType()
export class CharacterModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  level!: number;

  @Field()
  isDeleted!: boolean;

  @Field(() => CharacterClassModel)
  characterClass!: CharacterClassModel;

  @Field(() => AppearanceModel)
  appearance!: AppearanceModel;
}
