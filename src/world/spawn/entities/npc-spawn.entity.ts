import { EntitySpawn } from 'src/world/spawn/entities/entity-spawn.entity';
import { Npc } from '../../../characters/npc/entities/npc.entity';
import { OneToMany } from 'typeorm';
import { Field } from '@nestjs/graphql';

export class NpcSpawn extends EntitySpawn {
  @OneToMany(() => Npc, npc => npc.spawn)
  @Field(() => [Npc])
  entity: Npc[];
}
