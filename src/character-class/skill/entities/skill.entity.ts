import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SkillEffectConfig } from '../dto/skill-effect-config.input';

@Entity()
@ObjectType()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  @Field({ description: 'ID навыка' })
  id: string;

  @ManyToOne(() => CharacterClass, (characterClass) => characterClass.skills, {
    onDelete: 'CASCADE',
  })
  @Field(() => CharacterClass, {
    description: 'Класс, к которому относится навык',
  })
  characterClass: CharacterClass;

  @Column()
  @Field({ description: 'Название навыка' })
  name: string;

  @Column()
  @Field({ description: 'Ключ иконки навыка' })
  icon: string;

  @Column({ type: 'int' })
  @Field(() => Int, { description: 'Кулдаун в миллисекундах' })
  cooldownMs: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int, { description: 'Стоимость маны' })
  manaCost: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int, { description: 'Наносимый урон' })
  damage: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int, { description: 'Восстанавливаемое здоровье' })
  heal: number;

  @Column({ type: 'int' })
  @Field(() => Int, { description: 'Дистанция' })
  range: number;

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

  @OneToMany(() => CharacterSkill, (characterSkill) => characterSkill.skill, {
    cascade: true,
  })
  @Field(() => [CharacterSkill])
  characterSkills: CharacterSkill[];

  @Column({ type: 'enum', enum: SkillType })
  @Field(() => SkillType, { description: 'Тип скилла' })
  type: SkillType;

  @Column()
  @Field({ description: 'Ключ тайлсета' })
  tilesetKey: string;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => [SkillEffectConfig], {
    nullable: true,
    description: 'Геймплейные эффекты',
  })
  effects?: SkillEffectConfig[];

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
