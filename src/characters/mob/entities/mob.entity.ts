import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MobSpawn } from '../../../world/spawn/entities/mob-spawn.entity';
import { ActorEntity } from 'src/common/entities/actor-entity.entity';

@Entity()
@ObjectType()
export class Mob extends ActorEntity {
  @Column()
  @Field(() => Int)
  triggerRange: number;

  @Column()
  @Field(() => Int)
  chaseSpeed: number;

  @Column()
  @Field(() => Int)
  expReward: number;

  @Column()
  @Field(() => Int)
  respawnTime: number;

  @ManyToOne(() => MobSpawn, spawn => spawn.entity, { cascade: true })
  @Field(() => MobSpawn)
  spawn: MobSpawn;
}
