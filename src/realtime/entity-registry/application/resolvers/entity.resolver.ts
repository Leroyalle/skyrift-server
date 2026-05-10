import {
  GET_MOB_SESSION_SNAPSHOT_BY_ID_PORT,
  type GetMobSessionSnapshotByMobIdPort,
  MOB_SESSION_READER_TOKEN,
  type MobSessionReaderPort,
} from 'src/realtime/mob-session';
import { NPC_SESSION_READER_TOKEN, type NpcSessionReaderPort } from 'src/realtime/npc-session';
import {
  GET_PLAYER_SESSION_SNAPSHOT_BY_CHARACTER_ID_TOKEN,
  type GetPlayerSessionSnapshotByCharacterIdPort,
  PLAYER_SESSION_READER_TOKEN,
  type PlayerSessionReaderPort,
} from 'src/realtime/player-session';
import type { IEntityRef, IEntityType } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { EntityResolverPort, ResolvedEntityMap } from '../ports/entity-resolver.port';

@Injectable()
export class EntityResolver implements EntityResolverPort {
  constructor(
    @Inject(GET_PLAYER_SESSION_SNAPSHOT_BY_CHARACTER_ID_TOKEN)
    private readonly getPlayerSessionSnapshotPort: GetPlayerSessionSnapshotByCharacterIdPort,
    @Inject(GET_MOB_SESSION_SNAPSHOT_BY_ID_PORT)
    private readonly getMobSessionSnapshotPort: GetMobSessionSnapshotByMobIdPort,
    @Inject(PLAYER_SESSION_READER_TOKEN) private playerSessionReader: PlayerSessionReaderPort,
    @Inject(MOB_SESSION_READER_TOKEN) private readonly mobSessionReader: MobSessionReaderPort,
    @Inject(NPC_SESSION_READER_TOKEN) private readonly npcSessionReader: NpcSessionReaderPort,
  ) {}

  public getByRef<T extends IEntityType>(ref: IEntityRef<T>): ResolvedEntityMap[T] | null {
    if (ref.type === 'player') {
      return this.getPlayerSessionSnapshotPort.execute(ref.id) as ResolvedEntityMap[T];
    } else if (ref.type === 'mob') {
      return this.getMobSessionSnapshotPort.execute(ref.id) as ResolvedEntityMap[T];
    } else if (ref.type === 'npc') {
      return this.npcSessionReader.findById(ref.id) as ResolvedEntityMap[T];
    }

    return null;
  }

  public getByLocationId<T extends IEntityType>(
    locationId: string,
    type: T,
  ): ResolvedEntityMap[T][] {
    if (type === 'player') {
      return this.playerSessionReader.getByLocationId(locationId) as ResolvedEntityMap[T][];
    } else if (type === 'mob') {
      return this.mobSessionReader.getByLocationId(locationId) as ResolvedEntityMap[T][];
    } else if (type === 'npc') {
      return this.npcSessionReader.getByLocationId(locationId) as ResolvedEntityMap[T][];
    }

    return [];
  }

  public getIterable<T extends IEntityType>(type: T): Iterable<ResolvedEntityMap[T]> {
    if (type === 'player') {
      return this.playerSessionReader.getIterable() as Iterable<ResolvedEntityMap[T]>;
    } else if (type === 'mob') {
      return this.mobSessionReader.getIterable() as Iterable<ResolvedEntityMap[T]>;
    } else if (type === 'npc') {
      return this.npcSessionReader.getIterable() as Iterable<ResolvedEntityMap[T]>;
    }

    throw new Error('Unsupported entity type');
  }
}
