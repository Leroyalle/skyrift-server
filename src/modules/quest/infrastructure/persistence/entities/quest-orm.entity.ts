import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import { QuestPrerequisite } from '../../../domain/types/prerequisites.type';
import { QuestStep } from '../../../domain/types/quest-step.type';

@ObjectType()
@Entity('quests')
export class QuestOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column()
  @Field()
  name!: string;

  @Column()
  @Field()
  description!: string;

  @Column()
  @Field(() => Int)
  expReward!: number;

  @Column()
  @Field(() => Int)
  goldReward!: number;

  @Column({ type: 'jsonb', nullable: true })
  itemRewards!: {
    templateId: string;
    quantity: number;
  }[];

  @Column({ type: 'jsonb' })
  steps!: QuestStep[];

  @Column({ type: 'jsonb', nullable: true })
  prerequisites!: QuestPrerequisite[] | null;

  @Column()
  @Field()
  giverNpcId!: string;
}
