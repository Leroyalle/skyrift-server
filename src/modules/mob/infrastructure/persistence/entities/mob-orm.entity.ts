import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { Column, Entity } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity('mobs')
@ObjectType()
export class MobOrmEntity extends ActorEntity {
  @Column()
  @Field(() => Int)
  triggerRange!: number;

  @Column()
  @Field(() => Int)
  chaseSpeed!: number;

  @Column()
  @Field(() => Int)
  expReward!: number;

  @Column()
  @Field(() => Int)
  respawnTime!: number;

  @Column()
  @Field()
  spawnId!: string;
}
