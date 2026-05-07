import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { Column, Entity } from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('npcs')
export class NpcOrmEntity extends ActorEntity {
  @Column()
  @Field()
  spawnId!: string;

  @Column()
  @Field()
  chaseSpeed!: number;
}
