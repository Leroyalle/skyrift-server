import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Skill } from 'src/character-class/skill/entities/skill.entity';
import { Character } from 'src/character/entities/character.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class CharacterSkill {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => Skill)
  @Field(() => Skill, { description: 'Навык' })
  skill: Skill;

  @ManyToOne(() => Character, (character) => character.characterSkills, {
    cascade: true,
  })
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column({ type: 'bigint', nullable: true })
  @Field({ nullable: true, description: 'Время последнего использования' })
  lastUsedAt: number;

  @Column({ type: 'bigint', nullable: true })
  @Field({ nullable: true, description: 'Время окончания кулдауна' })
  cooldownEnd: number;

  @Column({ type: 'int', default: 1 })
  @Field(() => Int, { description: 'Уровень навыка' })
  level: number;
}
