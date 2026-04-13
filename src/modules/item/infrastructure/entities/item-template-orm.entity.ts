import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

import type { ItemType } from '../../domain/constants/item-type.constant';

@Entity('item_templates')
@ObjectType()
export class ItemTemplateOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column()
  @Field()
  name!: string;

  @Column()
  @Field()
  itemType!: ItemType;

  @Column({ nullable: true })
  @Field()
  slot!: EquipmentSlot | null;

  @Column()
  @Field()
  iconKey!: string;

  @Column(() => TextureConfig, { prefix: false })
  @Field(() => TextureConfig)
  texture!: TextureConfig;

  @Column({ nullable: true })
  @Field(() => Int)
  physicalDefense!: number | null;

  @Column({ nullable: true })
  @Field(() => Int)
  magicDefense!: number | null;

  @Column({ nullable: true })
  @Field(() => Int)
  physicalDamage!: number | null;

  @Column({ nullable: true })
  @Field(() => Int)
  magicDamage!: number | null;
}

@ObjectType()
class TextureConfig {
  @Column()
  @Field()
  atlasKey!: string;

  @Column()
  @Field()
  frameName!: string;
}
