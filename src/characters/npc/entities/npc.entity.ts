import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { NpcSpawn } from '../../../world/spawn/entities/npc-spawn.entity';
import { OneToMany } from 'typeorm';
import { Field } from '@nestjs/graphql';

export class Npc extends ActorEntity {
  @OneToMany(() => NpcSpawn, spawn => spawn.entity)
  @Field(() => NpcSpawn)
  spawn: NpcSpawn;
}
