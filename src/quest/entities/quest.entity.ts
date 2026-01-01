import { Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerQuest } from './player-quest.entity';

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column()
  @Field(() => Int)
  expReward: number;

  @Column()
  @Field(() => PlayerQuest)
  playerQuests: PlayerQuest[];

  @Column()
  @Field(() => Int)
  stepsCount: number;
}
