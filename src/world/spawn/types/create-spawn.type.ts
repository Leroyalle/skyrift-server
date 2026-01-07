import { MobSpawn } from '../entities/mob-spawn.entity';
import { NpcSpawn } from '../entities/npc-spawn.entity';

export type ICreateSpawn = TNpcSpawn | TMobSpawn;

type TNpcSpawn = {
  type: 'npc';
  entity: NpcSpawn;
};

type TMobSpawn = {
  type: 'mob';
  entity: MobSpawn;
};
