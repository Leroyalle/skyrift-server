import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Skill } from 'src/character-class/skill/entities/skill.entity';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Effect {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => EffectType)
  type: EffectType;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  damagePerSecond?: number;

  @Column({ nullable: true })
  @Field(() => Int)
  durationMs: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  amount?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  slowPercent?: number;

  @ManyToOne(() => Skill, (skill) => skill.effects)
  @Field(() => Skill)
  skill: Skill;
}
