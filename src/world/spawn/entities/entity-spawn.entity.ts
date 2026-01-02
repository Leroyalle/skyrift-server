import { Field, ID, Int, InterfaceType } from '@nestjs/graphql';
import { Mob } from 'src/characters/mob/entities/mob.entity';
import { Npc } from 'src/characters/npc/entities/npc.entity';
import { Location } from 'src/world/location/entities/location.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';

@InterfaceType()
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'entityType' } })
export abstract class EntitySpawn {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => Int)
  spawnX: number;

  @Column()
  @Field(() => Int)
  spawnY: number;

  @Column()
  @Field(() => Int)
  areaRadius: number;

  abstract location: Location;

  abstract entity: (Mob | Npc)[];
}
