import { EffectType } from 'src/common/enums/skill/effect-type.enum';

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SkillEffectConfig {
  @Field(() => EffectType, { description: 'Тип эффекта скилла' })
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
