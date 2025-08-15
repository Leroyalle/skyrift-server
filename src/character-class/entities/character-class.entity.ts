import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Character } from 'src/character/entities/character.entity';
import { Faction } from 'src/faction/entities/faction.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Skill } from '../skill/entities/skill.entity';

@ObjectType()
@Entity()
export class CharacterClass {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID класса' })
  id: string;

  @Column()
  @Field(() => String, { description: 'Название класса' })
  name: string;

  @Column()
  @Field(() => String, { description: 'Описание класса' })
  description: string;

  @Column()
  @Field(() => String, { description: 'Логотип класса' })
  logo: string;

  @ManyToOne(() => Faction, (faction) => faction.characterClasses)
  @Field(() => Faction, { description: 'Фракция класса' })
  faction: Faction;

  @OneToMany(() => Character, (character) => character.characterClass)
  @Field(() => [Character], { description: 'Персонажи класса' })
  characters: Character[];

  @OneToMany(() => Skill, (skill) => skill.characterClass)
  @Field(() => [Skill], { description: 'Список навыков класса' })
  skills: Skill[];
}
