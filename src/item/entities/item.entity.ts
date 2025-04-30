import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field({ description: 'Название предмета' })
  name: string;

  @Column('text')
  @Field({ description: 'Описание предмета' })
  description: string;

  @Column()
  @Field(() => ItemTypeEnum, { description: 'Тип предмета' })
  type: ItemTypeEnum;

  @Column({ type: 'int', default: 0 })
  @Field({ description: 'Сила предмета' })
  power: number;

  @Column({ type: 'int', default: 1 })
  @Field({ description: 'Прочность предмета' })
  durability: number;

  @ManyToOne(() => Character, (character) => character.items)
  @Field(() => Character, { description: 'Владелец предмета' })
  owner: Character;

  // @ManyToOne(() => Monster, (monster) => monster.droppedItems, { nullable: true })
  // @Field(() => Monster, { nullable: true })
  // droppedBy: Monster;
}
