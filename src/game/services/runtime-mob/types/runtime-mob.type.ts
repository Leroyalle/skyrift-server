import { PositionDto } from 'src/common/dto/position.dto';
import { RuntimeActorEntity } from 'src/common/types/actor-entity.type';
import { TDirection } from 'src/game/types/entity/direction.type';
import { Mob } from 'src/mob/entities/mob.entity';
import { MobSpawn } from 'src/mob/mob-spawn/entities/mob-spawn.entity';

export interface IRuntimeMob
  extends MobSummary,
    MobSpawnSummary,
    RuntimeActorEntity<IRuntimeMob>,
    RuntimeMobStats,
    UniqueStats {}

type MobSpawnSummary = Omit<MobSpawn, 'location' | 'mob'>;
type MobSummary = Omit<Mob, 'spawn' | 'updatedAt' | 'createdAt'>;

interface RuntimeMobStats {
  x: number;
  y: number;
  lastDirection: TDirection;
  isInSpawnArea: boolean;
  respawnIn: number | null;
  currentPath: PositionDto[] | null;
}

interface UniqueStats {
  mobId: Mob['id'];
}

export type MobActionState =
  | 'idle'
  | 'move'
  | 'pursue'
  | 'attack'
  | 'dead'
  | 'return';
