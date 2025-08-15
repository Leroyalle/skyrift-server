import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ type: 'json', nullable: true })
  @Field(() => String, {
    nullable: true,
    description: 'Дополнительные параметры в JSON',
  })
  extraParams?: Record<string, any>;

  @OneToMany(() => CharacterSkill, (characterSkill) => characterSkill.skill, {
    cascade: true,
  })
  @Field(() => CharacterSkill)
  characterSkills: CharacterSkill[];
}
