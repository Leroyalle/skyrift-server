import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { PlayerQuest } from 'src/quest/entities/player-quest.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class CharacterOrmEntity extends ActorEntity {
  @Column({ default: 0 })
  @Field(() => Int, { description: 'Опыт персонажа', defaultValue: 0 })
  experience!: number;

  @Column({ default: 100 })
  @Field(() => Int, {
    description: 'Опыт до следующего уровня',
    defaultValue: 100,
  })
  experienceToNextLevel!: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Очки навыков', defaultValue: 0 })
  skillPoints!: number;

  @Column({ default: false })
  @Field(() => Boolean, {
    description: 'Статус удален или нет',
    defaultValue: false,
  })
  isDeleted!: boolean;

  @Column()
  @Field(() => User, { description: 'Аккаунт пользователя' })
  userId!: string;

  @ManyToOne(() => CharacterClass, characterClass => characterClass.characters)
  @Field(() => CharacterClass, { description: 'Класс персонажа' })
  classId!: string;

  @Column()
  @Field({ description: 'Айди локации в которой находится игрок' })
  locationId!: string;

  @Column({ type: 'array' })
  @Field({ description: 'Навыки персонаж' })
  skillsIds!: string[];

  @Column()
  @Field()
  bagId!: string;

  @Column({ type: 'array' })
  @Field(() => [PlayerQuest])
  questsIds!: string[];
}
