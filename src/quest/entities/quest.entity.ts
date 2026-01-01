import { Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerQuest } from './player-quest.entity';
import { QuestStep } from '../types/quest-step.type';

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
  @Field(() => Int)
  goldReward: number;

  @Column({ type: 'jsonb', nullable: true })
  itemRewards: {
    templateId: string;
    quantity: number;
  }[];

  @Column({ type: 'jsonb' })
  steps: QuestStep[];

  @Column()
  @Field(() => PlayerQuest)
  playerQuests: PlayerQuest[];
}
