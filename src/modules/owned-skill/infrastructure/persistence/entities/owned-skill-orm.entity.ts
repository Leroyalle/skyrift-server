import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity('owned_skills')
@Unique('UQ_owned_skill_owner_skill', ['ownerType', 'ownerId', 'skillId'])
@ObjectType()
export class OwnedSkillOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column()
  @Field({ description: 'Навык' })
  skillId!: string;

  @Column()
  ownerId!: string;

  @Column()
  ownerType!: 'player' | 'npc' | 'mob';

  @Column({ type: 'bigint', nullable: true })
  @Field({ nullable: true, description: 'Время последнего использования' })
  lastUsedAt!: number;

  @Column({ type: 'bigint', nullable: true })
  @Field({ nullable: true, description: 'Время окончания кулдауна' })
  cooldownEnd!: number;

  @Column({ type: 'int', default: 1 })
  @Field(() => Int, { description: 'Уровень навыка' })
  level!: number;
}
