import type { EffectType } from 'src/modules/effect/domain/types/effect.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class EffectOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column()
  @Field()
  type!: EffectType;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  damagePerSecond?: number;

  @Column({ nullable: true })
  @Field(() => Int)
  durationMs!: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  amount?: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  slowPercent?: number;

  @Column()
  @Field()
  skillId!: string;
}
