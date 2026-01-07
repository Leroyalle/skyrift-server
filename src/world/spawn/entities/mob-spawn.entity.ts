import { Mob } from 'src/characters/mob/entities/mob.entity';
import { Location } from 'src/world/location/entities/location.entity';
import { EntitySpawn } from 'src/world/spawn/entities/entity-spawn.entity';
import { ChildEntity, ManyToOne, OneToMany } from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

@ChildEntity()
@ObjectType()
export class MobSpawn extends EntitySpawn {
  @OneToMany(() => Mob, mob => mob.spawn)
  @Field(() => [Mob])
  entity: Mob[];

  @ManyToOne(() => Location, location => location.mobSpawn)
  @Field(() => Location)
  location: Location;
}
