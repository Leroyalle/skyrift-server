import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamp } from './timestamp.entity';

@ObjectType()
export abstract class ActorEntity extends Timestamp {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'Имя' })
  name: string;

  @Column({ default: 1 })
  @Field(() => Int, { description: 'Уровень', defaultValue: 1 })
  level: number;

  @Column({ default: 300 })
  @Field(() => Int, {
    description: 'Максимальное здоровье',
    defaultValue: 300,
  })
  maxHp: number;

  @Column({ default: 300 })
  @Field(() => Int, {
    description: 'Текущее здоровье',
    defaultValue: 300,
  })
  hp: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Физический урон', defaultValue: 55 })
  basePhysicalDamage: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Магический урон', defaultValue: 26 })
  baseMagicDamage: number;

  @Column({ default: 0 })
  @Field(() => Int, {
    description: 'Физическая защита (снижает физ. урон)',
    defaultValue: 0,
  })
  physicalDefense: number;

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

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Жив ли персонаж', defaultValue: true })
  isAlive: boolean;

  @Column()
  @Field(() => Int, { description: 'X координата позиции игрока' })
  x: number;

  @Column()
  @Field(() => Int, { description: 'Y координата позиции игрока' })
  y: number;
}
