import { BaseItem } from 'src/item/entities/item.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, ObjectType } from '@nestjs/graphql';

import { EquipmentOwnerType } from '../types/equipment-owner-type';

@ObjectType()
@Entity('equipment')
export class Equipment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Field(() => Character)
  // @OneToOne(() => Character, character => character.equipment)
  // @JoinColumn()
  // character: Character;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'helmetId' })
  helmet: BaseItem | null;

  @Field(() => BaseItem)
  @ManyToOne(() => BaseItem, { nullable: true })
  @JoinColumn({ name: 'breastplateId' })
  breastplate: BaseItem | null;

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
