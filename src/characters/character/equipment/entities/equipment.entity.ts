import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Character } from 'src/characters/character/entities/character.entity';
import { BaseItem } from 'src/item/entities/item.entity';
import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('equipment')
export class Equipment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Character)
  @OneToOne(() => Character, character => character.equipment)
  @JoinColumn()
  character: Character;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'headId' })
  head: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'bodyId' })
  body: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'glovesId' })
  gloves: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'legsId' })
  legs: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'mainHandId' })
  mainHand: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'offHandId' })
  offHand: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'ring1Id' })
  ring1: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'ring2Id' })
  ring2: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'cloakId' })
  cloak: BaseItem | null;
}
