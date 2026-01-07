import { Mob } from 'src/characters/mob/entities/mob.entity';
import { PositionDto } from 'src/common/dto/position.dto';
import { RuntimeActorEntity } from 'src/common/types/actor-entity.type';
import { TDirection } from 'src/game/types/entity/direction.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { MobSpawn } from 'src/world/spawn/entities/mob-spawn.entity';

import { AggroTable } from '../lib/aggro.lib';

export interface IRuntimeMob
  extends
    MobSummary,
    MobSpawnSummary,
    RuntimeActorEntity<'mob'>,
    RuntimeMobStats,
    UniqueStats<'mob'> {}

type MobSpawnSummary = Omit<MobSpawn, 'location' | 'entity'>;
type MobSummary = Omit<Mob, 'spawn' | 'updatedAt' | 'createdAt'>;

interface RuntimeMobStats {
  x: number;
  y: number;
  lastDirection: TDirection;
  isInSpawnArea: boolean;
  respawnIn: number | null;
  nextThinkAt: number;
  currentPath: PositionDto[] | null;
  aggro: AggroTable;
}

interface UniqueStats<T extends EntityType> {
  spawnId: MobSpawn['id'];
  type: T;
}

export type MobActionState = 'idle' | 'move' | 'pursue' | 'attack' | 'dead' | 'return';
