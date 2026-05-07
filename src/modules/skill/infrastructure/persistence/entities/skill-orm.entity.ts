import type { SkillType } from 'src/modules/skill/domain/types/skill.type';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity('skills')
@ObjectType()
export class SkillOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field({ description: 'ID навыка' })
  id!: string;

  @Column()
  @Field({
    description: 'Класс, к которому относится навык',
  })
  classId!: string;

  @Column()
  @Field({ description: 'Название навыка' })
  name!: string;

  @Column()
  @Field({ description: 'Ключ иконки навыка' })
  icon!: string;

  @Column({ type: 'int' })
  @Field(() => Int, { description: 'Кулдаун в миллисекундах' })
  cooldownMs!: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int, { description: 'Стоимость маны' })
  manaCost!: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int, { description: 'Наносимый урон' })
  damage!: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int, { description: 'Восстанавливаемое здоровье' })
  heal!: number;

  @Column({ type: 'int' })
  @Field(() => Int, { description: 'Дистанция' })
  range!: number;

  @Column({ nullable: true })
  @Field({
    description: 'Радиус действия в тайлах для AoE-скиллов (квадратная зона)',
    nullable: true,
  })
  areaRadius?: number;

  @Column({ nullable: true })
  @Field({
    description: 'Урон в секунду для AoE-скиллов',
    nullable: true,
  })
  damagePerSecond?: number;

  @Column({ nullable: true })
  @Field({
    description: 'Длительность действия AoE-скилла в миллисекундах',
    nullable: true,
  })
  duration?: number;

  @Column()
  @Field({ description: 'Тип скилла' })
  type!: SkillType;

  @Column()
  @Field({ description: 'Ключ тайлсета' })
  tilesetKey!: string;

  @Column({ type: 'json', nullable: true })
  @Field(() => String, { nullable: true, description: 'Визуальные эффекты' })
  visualEffects?: {
    type: 'animation' | 'particle' | 'sound';
    assetKey: string;
    durationMs?: number;
    frameRate?: number;
    offset?: { x: number; y: number };
  }[];

  @Column({ type: 'json', nullable: true })
  @Field(() => String, {
    nullable: true,
    description: 'Дополнительные параметры в JSON',
  })
  extraParams?: Record<string, any>;
}
