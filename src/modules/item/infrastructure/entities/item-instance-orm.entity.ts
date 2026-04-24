import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

import type { ItemContainerType } from '../../domain/types/item-instance.type';

@Entity('item_instances')
@ObjectType()
export class ItemInstanceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column()
  @Field()
  templateId!: string;

  @Column()
  @Field()
  ownerId!: string;

  @Column()
  @Field()
  ownerType!: IEntityType;

  @Column()
  @Field()
  quantity!: number;

  @Column({ default: 1 })
  @Field({ defaultValue: 1 })
  durability!: number;

  @Column()
  @Field()
  containerId!: string;

  @Column()
  @Field()
  containerType!: ItemContainerType;
}
