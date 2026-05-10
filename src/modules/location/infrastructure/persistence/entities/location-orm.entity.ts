import { TiledMap } from 'src/common/types/tiled-map.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@Entity('locations')
@ObjectType()
export class LocationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column()
  @Field()
  name!: string;

  @Column({ unique: true })
  @Field()
  filename!: string;

  @Column('jsonb')
  @Field(() => TiledMap)
  tiledMap!: TiledMap;

  @Column('jsonb')
  @Field(() => [[Int]])
  passableMap!: number[][];

  @Column()
  @Field(() => Int)
  width!: number;

  @Column()
  @Field(() => Int)
  height!: number;

  @Column()
  @Field(() => Int)
  tileWidth!: number;

  @Column()
  @Field(() => Int)
  tileHeight!: number;
}
