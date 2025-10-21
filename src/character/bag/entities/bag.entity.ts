import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Item } from 'src/item/entities/item.entity';
import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Bag {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @OneToMany(() => Item, (item) => item.bag)
  @Field(() => [Item])
  items: Item[];
}
