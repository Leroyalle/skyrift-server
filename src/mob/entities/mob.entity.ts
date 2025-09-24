import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MobSpawn } from '../mob-spawn/entities/mob-spawn.entity';

@Entity()
@ObjectType()
export class Mob {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field(() => Int)
  damage: number;

  @Column()
  @Field(() => Int)
  physicalDefense: number;

  @Column()
  @Field(() => Int)
  magicDefense: number;

  @Column()
  @Field(() => Int)
  attackRange: number;

  @Column()
  @Field(() => Int)
  attackSpeed: number;

  @Column()
  @Field(() => Int)
  triggerRange: number;

  @Column()
  @Field(() => Int)
  walkSpeed: number;

  @Column()
  @Field(() => Int)
  chaseSpeed: number;

  @Column()
  @Field(() => Int)
  exp_reward: number;

  @Column()
  @Field(() => Int)
  respawnTime: number;

  @OneToMany(() => MobSpawn, (spawn) => spawn.mob, { cascade: true })
  @Field(() => [MobSpawn])
  spawn: MobSpawn[];
}
