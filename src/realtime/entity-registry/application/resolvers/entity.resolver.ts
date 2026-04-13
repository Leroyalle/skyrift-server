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

import type { EntityByLocationResultMap, EntityResolverPort } from '../ports/entity-resolver.port';

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

  public getByRef(ref: IEntityRef) {
    if (ref.type === 'player') {
      return this.getPlayerSessionSnapshotPort.execute(ref.id);
    } else if (ref.type === 'mob') {
      return this.getMobSessionSnapshotPort.execute(ref.id);
    } else if (ref.type === 'npc') {
      return this.npcSessionReader.findById(ref.id);
    }

    return null;
  }

  public getByLocationId<T extends IEntityType>(
    locationId: string,
    type: T,
  ): EntityByLocationResultMap[T] {
    if (type === 'player') {
      this.playerSessionReader.getByLocationId(locationId) as EntityByLocationResultMap[T];
    } else if (type === 'mob') {
      return this.mobSessionReader.getByLocationId(locationId) as EntityByLocationResultMap[T];
    } else if (type === 'npc') {
      return this.npcSessionReader.getByLocationId(locationId) as EntityByLocationResultMap[T];
    }

    return [];
  }
}
