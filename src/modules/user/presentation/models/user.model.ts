import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field(() => ID, { description: 'ID пользователя' })
  id!: string;

  @Field({ description: 'Имя пользователя' })
  name!: string;

  @Field({ description: 'Email пользователя' })
  email!: string;

  @Field({ description: 'Password пользователя' })
  password!: string;

  // @OneToMany(() => Character, person => person.id)
  // @Field(() => [Character], { description: 'Персонажи аккаунта' })
  // persons: Character[];

  @Field({ description: 'Дата создания пользователя' })
  createdAt!: Date;

  @Field({ description: 'Дата последнего обновления пользователя' })
  updatedAt!: Date;
}
