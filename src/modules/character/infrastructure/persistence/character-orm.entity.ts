import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { UserOrmEntity } from 'src/modules/user/infrastructure/persistence/entities/user-orm.entity';
import { Column, Entity } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('characters')
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
  @Field(() => UserOrmEntity, { description: 'Аккаунт пользователя' })
  userId!: string;

  @Column()
  @Field({ description: 'Класс персонажа' })
  classId!: string;

  @Column('uuid', { array: true })
  skillsIds!: string[];

  @Column('uuid', { nullable: true })
  @Field(() => String, { nullable: true })
  bagId!: string | null;

  @Column('uuid', { array: true })
  questsIds!: string[];
}
