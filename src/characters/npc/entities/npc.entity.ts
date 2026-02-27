import { ActorEntity } from 'src/common/entities/actor-entity.entity';
import { NpcServiceType } from 'src/common/enums/npc/npc-service-type.enum';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { Quest } from 'src/quest/entities/quest.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

import { NpcSpawn } from '../../../world/spawn/entities/npc-spawn.entity';

@ObjectType()
@Entity('npc')
export class Npc extends ActorEntity {
  @ManyToOne(() => NpcSpawn, spawn => spawn.entities)
  @Field(() => NpcSpawn)
  spawn: NpcSpawn;

  @OneToMany(() => Quest, quest => quest.giverNpc)
  @Field(() => [Quest])
  givenQuests: Quest[];

  @Column({ type: 'enum', enum: NpcServiceType, default: NpcServiceType.Quests })
  @Field(() => NpcServiceType)
  service: NpcServiceType;
}
