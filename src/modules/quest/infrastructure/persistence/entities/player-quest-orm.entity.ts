import { Timestamp } from 'src/common/entities/timestamp.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, ObjectType } from '@nestjs/graphql';

import { QuestProgress } from '../../../domain/types/quest-progress.type';
import { StepType } from '../../../domain/types/quest-step.type';

@ObjectType()
@Entity('player_quests')
export class PlayerQuestOrmEntity extends Timestamp {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column()
  characterId!: string;

  @Column()
  questId!: string;

  @Column({ type: 'int', default: 0 })
  stepIndex!: number;

  @Column({ type: 'jsonb', nullable: true })
  progress!: QuestProgress<StepType> | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date | null;
}
