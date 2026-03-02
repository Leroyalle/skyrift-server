import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { PlayerQuest } from 'src/quest/entities/player-quest.entity';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/world/location/entities/location.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Bag } from '../bag/entities/bag.entity';
import { CharacterSkill } from '../character-skill/entities/character-skill.entity';

import { CharacterWallet } from './character-wallet.entity';

@ObjectType()
@Entity()
export class Character extends ActorEntity {
  @Column({ default: 0 })
  @Field(() => Int, { description: 'Опыт персонажа', defaultValue: 0 })
  experience: number;

  @Column({ default: 100 })
  @Field(() => Int, {
    description: 'Опыт до следующего уровня',
    defaultValue: 100,
  })
  experienceToNextLevel: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Очки навыков', defaultValue: 0 })
  skillPoints: number;

  @Column({ default: false })
  @Field(() => Boolean, {
    description: 'Статус удален или нет',
    defaultValue: false,
  })
  isDeleted: boolean;

  @ManyToOne(() => User, user => user.id)
  @Field(() => User, { description: 'Аккаунт пользователя' })
  user: User;

  @ManyToOne(() => CharacterClass, characterClass => characterClass.characters)
  @Field(() => CharacterClass, { description: 'Класс персонажа' })
  characterClass: CharacterClass;

  @ManyToOne(() => Location, location => location.characters)
  @JoinColumn({ name: 'locationId' })
  @Field(() => Location, { description: 'Локация персонажа', nullable: true })
  location: Location;

  @Column()
  @Field({ description: 'Айди локации в которой находится игрок' })
  locationId: string;

  @OneToMany(() => CharacterSkill, characterSkill => characterSkill.character)
  @Field(() => [CharacterSkill], { description: 'Навыки персонаж' })
  characterSkills: CharacterSkill[];

  @OneToOne(() => Bag, bag => bag.character, { cascade: true })
  @JoinColumn({ name: 'bag' })
  @Field(() => Bag)
  bag: Bag;

  @OneToMany(() => PlayerQuest, playerQuest => playerQuest.player, { cascade: true })
  @Field(() => [PlayerQuest])
  quests: PlayerQuest[];

  @OneToOne(() => CharacterWallet, wallet => wallet.character, {
    cascade: true,
  })
  @Field(() => CharacterWallet)
  wallet: CharacterWallet;
}
