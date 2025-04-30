import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn()
  @Field(() => ID, { description: 'ID локации' })
  id: number;

  @Column()
  @Field({ description: 'Название локации' })
  name: string;

  @Column('jsonb')
  @Field(() => [[Number]], {
    description: 'Массив с информацией о проходных клетках',
  })
  passableMap: number[][];

  @Column()
  @Field({ description: 'Ключ тайлсета' })
  tileSetKey: string;

  @Column()
  @Field({ description: 'Путь до .png с тайлами' })
  mapImageUrl: string;

  @OneToMany(() => Character, (character) => character.location)
  @Field(() => [Character], { description: 'Персонажи на локации' })
  characters: Character[];
}
