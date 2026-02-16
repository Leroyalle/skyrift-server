import { Character } from 'src/characters/character/entities/character.entity';
import { BaseItem } from 'src/item/entities/item.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Bag {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @OneToMany(() => BaseItem, item => item.bag, { cascade: true })
  @Field(() => [BaseItem])
  items: BaseItem[];

  @OneToOne(() => Character, character => character.bag)
  @Field(() => [BaseItem])
  character: Character;

  @Column({ default: 10 })
  @Field(() => Int, {
    description: 'Максимальный размер сумки',
    defaultValue: 10,
  })
  maxSlots: number;

  @Column({ default: 10 })
  @Field(() => Int, {
    description: 'Текущий размер сумки',
    defaultValue: 10,
  })
  currentSlots: number;
}
