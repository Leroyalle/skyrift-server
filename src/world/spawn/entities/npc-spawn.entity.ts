import { EntitySpawn } from 'src/world/spawn/entities/entity-spawn.entity';
import { Npc } from '../../../characters/npc/entities/npc.entity';
import { Entity, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('npc_spawn')
export class NpcSpawn extends EntitySpawn {
  @OneToMany(() => Npc, npc => npc.spawn)
  @Field(() => [Npc])
  entity: Npc[];
}
