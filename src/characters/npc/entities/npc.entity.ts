import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { Quest } from 'src/quest/entities/quest.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

import { NpcSpawn } from '../../../world/spawn/entities/npc-spawn.entity';

@ObjectType()
@Entity('npc')
export class Npc extends ActorEntity {
  @ManyToOne(() => NpcSpawn, spawn => spawn.entity)
  @Field(() => NpcSpawn)
  spawn: NpcSpawn;

  @OneToMany(() => Quest, quest => quest.giverNpc)
  @Field(() => [Quest])
  givenQuests: Quest[];
}
