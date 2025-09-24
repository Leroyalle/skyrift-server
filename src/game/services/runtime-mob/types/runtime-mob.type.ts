import { CurrentTarget } from 'src/character/types/live-character-state.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { TDirection } from 'src/game/types/entity/direction.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { Mob } from 'src/mob/entities/mob.entity';
import { MobSpawn } from 'src/mob/mob-spawn/entities/mob-spawn.entity';

export type RuntimeMob = RuntimeMobSpawn & {
  mob: Mob & RuntimeMobStats;
};

type RuntimeMobSpawn = Omit<MobSpawn, 'location'> & {
  locationId: string;
  type: EntityType;
};

type RuntimeMobStats = {
  x: number;
  y: number;
  lastAttackAt: number;
  lastMoveAt: number;
  lastDirection: TDirection;
  isInSpawnArea: boolean;
  respawnIn: number | null;
  currentPath: PositionDto[] | null;
  currentTarget: CurrentTarget | null;
  isAttacking: boolean;
  state: MobActionState;
};

export type MobActionState =
  | 'idle'
  | 'move'
  | 'pursue'
  | 'attack'
  | 'dead'
  | 'return';
