import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TiledMap } from 'src/common/types/tiled-map.type';

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  filename: string;

  @Column('jsonb')
  @Field(() => TiledMap)
  tiledMap: TiledMap;

  @Column('jsonb')
  @Field(() => [[Int]])
  passableMap: number[][];

  @Column()
  @Field(() => Int)
  width: number;

  @Column()
  @Field(() => Int)
  height: number;

  @Column()
  @Field(() => Int)
  tileWidth: number;

  @Column()
  @Field(() => Int)
  tileHeight: number;

  @OneToMany(() => Character, (character) => character.location)
  @Field(() => [Character])
  characters: Character[];
}
