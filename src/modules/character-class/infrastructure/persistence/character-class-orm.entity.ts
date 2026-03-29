import { Faction } from 'src/faction/entities/faction.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('character_classes')
export class CharacterClassOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID класса' })
  id!: string;

  @Column()
  @Field(() => String, { description: 'Название класса' })
  name!: string;

  @Column()
  @Field(() => String, { description: 'Описание класса' })
  description!: string;

  @Column()
  @Field(() => String, { description: 'Логотип класса' })
  logo!: string;

  @Column()
  @Field(() => Faction, { description: 'Фракция класса' })
  factionId!: string;

  @Column({ type: 'array' })
  @Field({ description: 'Список навыков класса' })
  skillsIds!: string[];
}
