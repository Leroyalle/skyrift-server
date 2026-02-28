import { Timestamp } from 'src/common/entities/timestamp.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Character } from './character.entity';

@ObjectType()
@Entity('character_wallet')
export class CharacterWallet extends Timestamp {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'int', default: 0 })
  @Field(() => Number)
  gold: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Number)
  gems: number;

  @OneToOne(() => Character, character => character.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'character_id' })
  character: Character;
}
