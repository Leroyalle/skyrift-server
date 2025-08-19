import { ObjectType, Field, Int } from '@nestjs/graphql';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';

@ObjectType()
export class SkillEffectConfig {
  @Field(() => EffectType)
  type: EffectType;

  @Field(() => Int, { nullable: true })
  damagePerSecond?: number;

  @Field(() => Int, { nullable: true })
  durationMs?: number;

  @Field(() => Int, { nullable: true })
  amount?: number;

  @Field(() => Int, { nullable: true })
  slowPercent?: number;
}
