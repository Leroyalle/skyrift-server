import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Faction } from 'src/faction/entities/faction.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
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

  @OneToOne(() => Faction)
  @JoinColumn()
  @Field(() => Faction, { description: 'Фракция персонажа' })
  faction: Faction;
}
