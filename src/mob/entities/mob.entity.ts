import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { MobSpawn } from '../mob-spawn/entities/mob-spawn.entity';
import { ActorEntity } from 'src/common/entities/actor-entity.entity';

@Entity()
@ObjectType()
export class Mob extends ActorEntity {
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
  expReward: number;

  @Column()
  @Field(() => Int)
  respawnTime: number;

  @OneToMany(() => MobSpawn, (spawn) => spawn.mob, { cascade: true })
  @Field(() => [MobSpawn])
  spawn: MobSpawn[];
}
