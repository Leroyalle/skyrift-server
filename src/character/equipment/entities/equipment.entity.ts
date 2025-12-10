import { Character } from 'src/character/entities/character.entity';
import { BaseItem } from 'src/item/entities/item.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Character, (character) => character.equipment)
  @JoinColumn()
  character: Character;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'headId' })
  head: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'bodyId' })
  body: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'glovesId' })
  gloves: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'legsId' })
  legs: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'mainHandId' })
  mainHand: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'offHandId' })
  offHand: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'ring1Id' })
  ring1: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'ring2Id' })
  ring2: BaseItem | null;

  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'cloakId' })
  cloak: BaseItem | null;
}
