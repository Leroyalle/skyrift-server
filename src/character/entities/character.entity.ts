import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { Item } from 'src/item/entities/item.entity';
import { Location } from 'src/location/entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID персонажа' })
  id: string;

  @Column()
  @Field(() => String, { description: 'Имя персонажа' })
  name: string;

  @Column()
  @Field(() => Int, { description: 'Уровень персонажа' })
  level: number;

  @Column()
  @Field(() => Boolean, {
    description: 'Статус удален или нет',
    defaultValue: false,
  })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.id)
  @Field(() => User, { description: 'Аккаунт пользователя' })
  user: User;

  @ManyToOne(
    () => CharacterClass,
    (characterClass) => characterClass.characters,
  )
  @Field(() => CharacterClass, { description: 'Класс персонажа' })
  characterClass: CharacterClass;

  @OneToMany(() => Item, (item) => item.owner)
  @Field(() => [Item], { description: 'Инвентарь персонажа' })
  items: Item[];

  @ManyToOne(() => Location, (location) => location.characters)
  @Field(() => Location, { description: 'Локация персонажа' })
  location: Location;
}
