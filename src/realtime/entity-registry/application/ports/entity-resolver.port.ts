import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';
import type { IEntityRef, IEntityType } from 'src/realtime/shared/types/entity-ref.type';

import type { EntitySnapshot } from '../types/entity-snapshot.type';

export interface EntityResolverPort {
  getByRef(ref: IEntityRef): EntitySnapshot | null;
  getByLocationId<T extends IEntityType>(locationId: string, type: T): EntityByLocationResultMap[T];
}

export interface EntityByLocationResultMap {
  player: PlayerSessionSnapshot[];
  mob: MobSessionSnapshot[];
  npc: EntitySnapshot[];
}
