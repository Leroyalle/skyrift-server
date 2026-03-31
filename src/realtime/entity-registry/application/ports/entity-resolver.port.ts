import type { GetMobSessionSnapshotByMobIdPort } from 'src/realtime/mob-session';
import type { GetPlayerSessionSnapshotByCharacterIdPort } from 'src/realtime/player-session';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

type ResolvedEntity =
  | ReturnType<GetPlayerSessionSnapshotByCharacterIdPort['execute']>
  | ReturnType<GetMobSessionSnapshotByMobIdPort['execute']>;

export interface EntityResolverPort {
  getByRef(ref: IEntityRef): ResolvedEntity | undefined;
}
