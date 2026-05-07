import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@Entity('entity_spawns')
@ObjectType()
export class EntitySpawnOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column()
  @Field(() => Int)
  spawnX!: number;

  @Column()
  @Field(() => Int)
  spawnY!: number;

  @Column()
  @Field(() => Int)
  areaRadius!: number;

  @Column()
  @Field()
  locationId!: string;
}
