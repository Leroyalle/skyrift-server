import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
export class Person {
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
}
