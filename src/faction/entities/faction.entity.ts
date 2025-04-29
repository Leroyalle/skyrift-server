import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
export class Faction {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID фракции' })
  id: string;

  @Column()
  @Field(() => String, { description: 'Название фракции' })
  name: string;

  @Column()
  @Field(() => String, { description: 'Описание фракции' })
  description: string;

  @Column()
  @Field(() => String, { description: 'Логотип фракции' })
  logo: string;
}
