import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Skill } from 'src/character-class/skill/entities/skill.entity';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';
import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
export class Effect {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => EffectType)
  type: EffectType;

  @Column()
  @Field(() => Int, { nullable: true })
  damagePerSecond?: number;

  @Column()
  @Field(() => Int)
  durationMs: number;

  @Column()
  @Field(() => Int, { nullable: true })
  amount?: number;

  @Column()
  @Field(() => Int, { nullable: true })
  slowPercent?: number;

  @ManyToOne(() => Skill, (skill) => skill.effects)
  @Field(() => Skill)
  skill: Skill;
}
