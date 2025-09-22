import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Location } from 'src/location/entities/location.entity';
import { Mob } from 'src/mob/entities/mob.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class MobSpawn {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => Int)
  x: number;

  @Column()
  @Field(() => Int)
  y: number;

  @Column()
  @Field(() => Int)
  areaRadius: number;

  @ManyToOne(() => Location, (location) => location.mobSpawn)
  @Field(() => Location)
  location: Location;

  @ManyToOne(() => Mob, (mob) => mob.spawn)
  @Field(() => Mob)
  mob: Mob;
}
