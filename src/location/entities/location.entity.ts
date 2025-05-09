import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LocationLayer } from './location-layer.entity';

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID локации' })
  id: string;

  @Column()
  @Field({ description: 'Название локации' })
  name: string;

  @Column()
  @Field({ description: 'Координата старта X' })
  startX: number;

  @Column()
  @Field({ description: 'Координата старта Y' })
  startY: number;

  @Column()
  @Field()
  width: number;

  @Column()
  @Field()
  height: number;

  @Column()
  @Field()
  tilesetKey: string;

  @Column()
  @Field()
  mapImageUrl: string;

  @Column()
  @Field(() => Int, { description: 'Ширина тайла' })
  tileWidth: number;

  @Column()
  @Field(() => Int, { description: 'Высота тайла' })
  tileHeight: number;

  @OneToMany(() => LocationLayer, (layer) => layer.location, { cascade: true })
  @Field(() => [LocationLayer])
  layers: LocationLayer[];

  @OneToMany(() => Character, (character) => character.location)
  @Field(() => [Character])
  characters: Character[];
}
