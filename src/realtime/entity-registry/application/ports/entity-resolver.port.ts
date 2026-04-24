import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { NpcSessionSnapshot } from 'src/realtime/npc-session';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';
import type { IEntityRef, IEntityType } from 'src/realtime/shared/types/entity-ref.type';

export interface EntityResolverPort {
  getByRef<T extends IEntityType>(ref: IEntityRef<T>): ResolvedEntityMap[T] | null;
  getByLocationId<T extends IEntityType>(locationId: string, type: T): ResolvedEntityMap[T][];
  getIterable<T extends IEntityType>(type: T): Iterable<ResolvedEntityMap[T]>;
}

export interface ResolvedEntityMap {
  player: PlayerSessionSnapshot;
  mob: MobSessionSnapshot;
  npc: NpcSessionSnapshot;
}
