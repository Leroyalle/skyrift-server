import { MobSpawn } from '../entities/mob-spawn.entity';
import { NpcSpawn } from '../entities/npc-spawn.entity';

export type ICreateSpawn = Omit<MobSpawn | NpcSpawn, 'id'>;
