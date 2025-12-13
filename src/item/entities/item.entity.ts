import { Field, ID, Int, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Bag } from 'src/character/bag/entities/bag.entity';
import { ArmorSlotEnum, WeaponSlotEnum } from 'src/common/enums/equipment-slot.enum';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import {
  ChildEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

@ObjectType()
class TextureConfig {
  @Column()
  @Field()
  atlasKey: string;

  @Column()
  @Field()
  frameName: string;
}

@InterfaceType()
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'itemType' } })
export abstract class BaseItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => ItemTypeEnum)
  @Column({ type: 'varchar' })
  itemType: ItemTypeEnum;

  @Field()
  @Column()
  iconKey: string;

  @ManyToOne(() => Bag, bag => bag.items, { nullable: true })
  @Field(() => Bag, { nullable: true })
  bag: Bag | null;
}

@ObjectType({ implements: BaseItem })
@ChildEntity(ItemTypeEnum.WEAPON)
export class Weapon extends BaseItem {
  @Column({ nullable: true })
  @Field(() => Int)
  physicalDamage: number;

  @Column({ nullable: true })
  @Field(() => Int)
  magicDamage: number;

  @Column({ type: 'int', default: 1 })
  @Field({ description: 'Прочность предмета' })
  durability: number;

  @Column({ nullable: true })
  @Field(() => WeaponSlotEnum)
  slot: WeaponSlotEnum;

  @Column(() => TextureConfig, { prefix: false })
  @Field(() => TextureConfig)
  texture: TextureConfig;
}

@ObjectType({ implements: BaseItem })
@ChildEntity(ItemTypeEnum.ARMOR)
export class Armor extends BaseItem {
  @Column({ nullable: true })
  @Field(() => Int)
  defense: number;

  @Column({ type: 'int', default: 1 })
  @Field({ description: 'Прочность предмета' })
  durability: number;

  @Column({ nullable: true })
  @Field(() => ArmorSlotEnum)
  slot: ArmorSlotEnum;
}

@ObjectType({ implements: BaseItem })
@ChildEntity(ItemTypeEnum.RESOURCE)
export class Resource extends BaseItem {
  @Column()
  @Field({ description: 'Описание предмета' })
  description: string;
}
