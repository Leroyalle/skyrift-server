import { Character } from 'src/characters/character/entities/character.entity';
import { Timestamp } from 'src/common/entities/timestamp.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, ObjectType } from '@nestjs/graphql';

import { QuestProgress } from '../types/quest-progress.type';
import { StepType } from '../types/quest-step.type';

import { Quest } from './quest.entity';

@ObjectType()
@Entity('player_quests')
export class PlayerQuest extends Timestamp {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => Character, character => character.quests, { onDelete: 'CASCADE' })
  player: Character;

  @ManyToOne(() => Quest, quest => quest.playerQuests, { onDelete: 'CASCADE' })
  quest: Quest;

  @Column({ type: 'int', default: 0 })
  stepIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  progress: QuestProgress<StepType> | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
