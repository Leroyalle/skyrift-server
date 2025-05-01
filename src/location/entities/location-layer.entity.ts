import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Location } from './location.entity';

@Entity()
@ObjectType()
export class LocationLayer {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @ManyToOne(() => Location, (location) => location.layers)
  @Field(() => Location)
  location: Location;

  @Column()
  @Field({ description: 'Название слоя' })
  name: string;

  @Column()
  @Field({ description: 'Тип слоя (tile, passable и т.п.)' })
  type: string;

  @Column()
  @Field({ description: 'Порядок отрисовки' })
  layerIndex: number;

  @Column('jsonb')
  @Field(() => [[Number]], {
    description: 'Двумерный массив идентификаторов тайлов',
    nullable: true,
  })
  tileData: number[][];

  @Column('jsonb', { nullable: true })
  @Field(() => [[Boolean]], {
    description:
      'Двумерный массив булевых значений, определяющих проходимость клеток слоя',
    nullable: true,
  })
  passableData: number[][];
}
