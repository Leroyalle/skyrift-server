import { Mob } from 'src/characters/mob/entities/mob.entity';
import { Npc } from 'src/characters/npc/entities/npc.entity';
import { NpcSpawn } from '../entities/npc-spawn.entity';
import { MobSpawn } from '../entities/mob-spawn.entity';

export type ICreateSpawn = TNpcSpawn | TMobSpawn;

type TNpcSpawn = {
  type: 'npc';
  entity: NpcSpawn;
};

type TMobSpawn = {
  type: 'mob';
  entity: MobSpawn;
};
