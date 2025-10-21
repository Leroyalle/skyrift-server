import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { Item } from 'src/item/entities/item.entity';
import { Location } from 'src/location/entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CharacterSkill } from '../character-skill/entities/character-skill.entity';
import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { Bag } from '../bag/entities/bag.entity';

@ObjectType()
@Entity()
export class Character extends ActorEntity {
  @Column({ default: 0 })
  @Field(() => Int, { description: 'Опыт персонажа', defaultValue: 0 })
  experience: number;

  @Column({ default: 100 })
  @Field(() => Int, {
    description: 'Опыт до следующего уровня',
    defaultValue: 100,
  })
  experienceToNextLevel: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Очки навыков', defaultValue: 0 })
  skillPoints: number;

  @Column({ default: false })
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
  @JoinColumn({ name: 'locationId' })
  @Field(() => Location, { description: 'Локация персонажа', nullable: true })
  location: Location;

  @Column()
  @Field({ description: 'Айди локации в которой находится игрок' })
  locationId: string;

  @OneToMany(() => CharacterSkill, (characterSkill) => characterSkill.character)
  @Field(() => [CharacterSkill], { description: 'Навыки персонаж' })
  characterSkills: CharacterSkill[];

  @OneToOne(() => Bag, (bag) => bag.character)
  @Field(() => Bag)
  bag: Bag;
}
