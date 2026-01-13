import { Location } from 'src/world/location/entities/location.entity';
import { EntitySpawn } from 'src/world/spawn/entities/entity-spawn.entity';
import { ChildEntity, ManyToOne, OneToMany } from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

import { Npc } from '../../../characters/npc/entities/npc.entity';

@ObjectType()
// @Entity('npc_spawn')
@ChildEntity()
export class NpcSpawn extends EntitySpawn {
  @OneToMany(() => Npc, npc => npc.spawn)
  @Field(() => [Npc])
  entities: Npc[];

  @ManyToOne(() => Location, location => location.npcSpawn)
  @Field(() => Location)
  location: Location;
}
