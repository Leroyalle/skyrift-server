import { Npc } from 'src/characters/npc/entities/npc.entity';
import { PositionDto } from 'src/common/dto/position.dto';
import { RuntimeActorEntity } from 'src/common/types/actor-entity.type';
import { TDirection } from 'src/game/types/entity/direction.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { NpcSpawn } from 'src/world/spawn/entities/npc-spawn.entity';

export interface IRuntimeNpc
  extends
    NpcSummary,
    NpcSpawnSummary,
    RuntimeActorEntity<'npc'>,
    RuntimeNpcStats,
    UniqueStats<'npc'> {}

type NpcSpawnSummary = Omit<NpcSpawn, 'location' | 'entity'>;
type NpcSummary = Omit<Npc, 'spawn' | 'updatedAt' | 'createdAt'>;

interface RuntimeNpcStats {
  // x: number;
  // y: number;
  lastDirection: TDirection;
  isInSpawnArea: boolean;
  respawnIn: number | null;
  nextThinkAt: number;
  currentPath: PositionDto[] | null;
  // aggro: AggroTable;
}

interface UniqueStats<T extends EntityType> {
  spawnId: NpcSpawn['id'];
  type: T;
}

export type NpcActionState = 'idle' | 'dead';
