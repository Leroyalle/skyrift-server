import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID пользователя' })
  id: string;

  @Column({ default: 'User' })
  @Field({ description: 'Имя пользователя' })
  name: string;

  @Column({ unique: true })
  @Field({ description: 'Email пользователя' })
  email: string;

  @Column()
  @Field({ description: 'Password пользователя' })
  password: string;

  @OneToMany(() => Character, (person) => person.id)
  @Field(() => [Character], { description: 'Персонажи аккаунта' })
  persons: Character[];

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { description: 'Refresh token', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field({ description: 'Дата создания пользователя' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field({ description: 'Дата последнего обновления пользователя' })
  updatedAt: Date;
}
