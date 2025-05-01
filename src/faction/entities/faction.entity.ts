import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Faction {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID фракции' })
  id: string;

  @Column()
  @Field(() => String, { description: 'Название фракции' })
  name: string;

  @Column()
  @Field(() => String, { description: 'Описание фракции' })
  description: string;

  @Column()
  @Field(() => String, { description: 'Логотип фракции' })
  logo: string;

  @OneToMany(() => CharacterClass, (characterClass) => characterClass.faction)
  @Field(() => [CharacterClass], { description: 'Классы фракции' })
  characterClasses: CharacterClass[];
}
