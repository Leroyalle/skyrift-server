import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LocationLayer } from './location-layer.entity';

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
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

  @OneToMany(() => LocationLayer, (layer) => layer.location, { cascade: true })
  @Field(() => [LocationLayer])
  layers: LocationLayer[];

  @OneToMany(() => Character, (character) => character.location)
  @Field(() => [Character])
  characters: Character[];
}
