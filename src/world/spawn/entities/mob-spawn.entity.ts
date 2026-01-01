import { Field, ObjectType } from '@nestjs/graphql';
import { Mob } from 'src/characters/mob/entities/mob.entity';
import { ChildEntity, OneToMany } from 'typeorm';
import { EntitySpawn } from 'src/world/spawn/entities/entity-spawn.entity';

@ChildEntity()
@ObjectType()
export class MobSpawn extends EntitySpawn {
  @OneToMany(() => Mob, mob => mob.spawn)
  @Field(() => [Mob])
  entity: Mob[];
}
