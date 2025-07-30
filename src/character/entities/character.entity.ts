import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { PositionDto } from 'src/common/dto/position.dto';
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
  @Field(() => Int, { description: 'Уровень персонажа', defaultValue: 1 })
  level: number;

  @Column({ default: 300 })
  @Field(() => Int, {
    description: 'Максимальное здоровье персонажа',
    defaultValue: 300,
  })
  maxHp: number;

  @Column({ default: 300 })
  @Field(() => Int, {
    description: 'Текущее здоровье персонажа',
    defaultValue: 300,
  })
  hp: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Физический урон', defaultValue: 0 })
  basePhysicalDamage: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Магический урон', defaultValue: 0 })
  baseMagicDamage: number;

  @Column({ default: 0 })
  @Field(() => Int, {
    description: 'Броня персонажа (снижает физ. урон)',
    defaultValue: 0,
  })
  defense: number;

  @Column({ default: 0 })
  @Field(() => Int, {
    description: 'Магическая защита (снижает маг. урон)',
    defaultValue: 0,
  })
  magicDefense: number;

  @Column({ default: 2.0 })
  @Field(() => Number, {
    description: 'Множитель крит. урона',
    defaultValue: 2.0,
  })
  critMultiplier: number;

  @Column({ default: 1.0 })
  @Field(() => Number, {
    description: 'Скорость атаки (уд/сек)',
    defaultValue: 1.0,
  })
  attackSpeed: number;

  @Column({ default: 1 })
  @Field(() => Int, {
    description: 'Дистанция атаки (в тайлах)',
    defaultValue: 1,
  })
  attackRange: number;

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

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Жив ли персонаж', defaultValue: true })
  isAlive: boolean;

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
  @Field(() => Location, { description: 'Локация персонажа', nullable: true })
  location: Location;

  @Column('json')
  @Field(() => PositionDto, { description: 'Позиция игрока' })
  position: PositionDto;

  // TODO: @Column({ default: 0.1 })
  // @Field(() => Number, {
  //   description: 'Шанс крит. удара (0–1)',
  //   defaultValue: 0.1,
  // })
  // critChance: number;
}
