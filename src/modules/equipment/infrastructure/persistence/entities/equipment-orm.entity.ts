import { IEntityType } from 'src/realtime/shared/types/entity-ref.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('equipments')
export class EquipmentOrmEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Field()
  ownerId!: string;

  @Column()
  @Field()
  ownerType!: IEntityType;

  @Column('uuid', { nullable: true })
  helmetId!: string | null;

  @Column('uuid', { nullable: true })
  breastplateId!: string | null;

  @Column('uuid', { nullable: true })
  glovesId!: string | null;

  @Column('uuid', { nullable: true })
  legsId!: string | null;

  @Column('uuid', { nullable: true })
  mainHandId!: string | null;

  @Column('uuid', { nullable: true })
  offHandId!: string | null;

  @Column('uuid', { nullable: true })
  ring1Id!: string | null;

  @Column('uuid', { nullable: true })
  ring2Id!: string | null;

  @Column('uuid', { nullable: true })
  cloakId!: string | null;
}
