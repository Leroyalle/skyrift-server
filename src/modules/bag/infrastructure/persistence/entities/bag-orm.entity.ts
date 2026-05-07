import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('bags')
export class BagOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column()
  @Field()
  ownerId!: string;

  @Column()
  @Field()
  ownerType!: IEntityType;

  @Column({ default: 10 })
  @Field(() => Int, {
    description: 'Максимальный размер сумки',
    defaultValue: 10,
  })
  maxSlots!: number;

  @Column({ default: 10 })
  @Field(() => Int, {
    description: 'Текущий размер сумки',
    defaultValue: 10,
  })
  currentSlots!: number;
}
