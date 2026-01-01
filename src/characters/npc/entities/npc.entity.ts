import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { NpcSpawn } from '../../../world/spawn/entities/npc-spawn.entity';
import { Entity, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Quest } from 'src/quest/entities/quest.entity';

@ObjectType()
@Entity('npc')
export class Npc extends ActorEntity {
  @OneToMany(() => NpcSpawn, spawn => spawn.entity)
  @Field(() => NpcSpawn)
  spawn: NpcSpawn;

  @OneToMany(() => Quest, quest => quest.giverNpc)
  @Field(() => [Quest])
  givenQuests: Quest[];
}
