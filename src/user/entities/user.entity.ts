import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Listing } from 'src/listing/entities/listing.entity';
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

  @Field(() => [Listing], { description: 'Password пользователя' })
  @OneToMany(() => Listing, (listing) => listing.user)
  listings: Listing[];

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
