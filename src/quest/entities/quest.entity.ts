import { Npc } from 'src/characters/npc/entities/npc.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import { QuestPrerequisite } from '../types/prerequisites.type';
import { QuestStep } from '../types/quest-step.type';

import { PlayerQuest } from './player-quest.entity';

@ObjectType()
@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
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

  @OneToMany(() => PlayerQuest, playerQuest => playerQuest.quest)
  @Field(() => PlayerQuest)
  playerQuests: PlayerQuest[];

  @Column({ type: 'jsonb', nullable: true })
  prerequisites: QuestPrerequisite[] | null;

  @ManyToOne(() => Npc, npc => npc.givenQuests)
  @Field(() => Npc)
  giverNpc: Npc;
}
