import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import { Item } from 'src/item/entities/item.entity';
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Bag {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @OneToMany(() => Item, (item) => item.bag)
  @Field(() => [Item])
  items: Item[];

  @OneToOne(() => Character, (character) => character.bag)
  @Field(() => Character)
  character: Character;
}
