import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Location } from './location.entity';

@Entity()
@ObjectType()
export class LocationLayer {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'ID слоя' })
  id: number;

  @ManyToOne(() => Location, (location) => location.layers)
  @Field(() => Location, { description: 'Локация, к которой принадлежит слой' })
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
  })
  tileData: number[][];

  @Column('jsonb')
  @Field(() => [[Number]], {
    description:
      'Двумерный массив булевых значений, определяющих проходимость клеток слоя',
  })
  passableData: number[][];
}
