import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { LootItem } from 'src/game/services/loot/types/loot.types';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { MobSpawn } from '../../../world/spawn/entities/mob-spawn.entity';

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

  @ManyToOne(() => MobSpawn, spawn => spawn.entities)
  @Field(() => MobSpawn)
  spawn: MobSpawn;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => String, { nullable: true })
  loot?: LootItem[];
}
