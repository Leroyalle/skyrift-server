import { Character } from 'src/characters/character/entities/character.entity';
import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class BagOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column()
  @Field(() => Character)
  ownerId!: string;

  @Column()
  @Field()
  ownerRef!: IEntityType;

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
