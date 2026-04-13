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
  characterId!: string;

  @Field()
  @Column({ nullable: true })
  helmetId!: string | null;

  @Field()
  @Column({ nullable: true })
  breastplateId!: string | null;

  @Field()
  @Column({ nullable: true })
  glovesId!: string | null;

  @Field()
  @Column({ nullable: true })
  legsId!: string | null;

  @Field()
  @Column({ nullable: true })
  mainHandId!: string | null;

  @Field()
  @Column({ nullable: true })
  offHandId!: string | null;

  @Field()
  @Column({ nullable: true })
  ring1Id!: string | null;

  @Field()
  @Column({ nullable: true })
  ring2Id!: string | null;

  @Field()
  @Column({ nullable: true })
  cloakId!: string | null;
}
