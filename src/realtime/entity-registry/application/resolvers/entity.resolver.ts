import {
  GET_MOB_SESSION_SNAPSHOT_BY_ID_PORT,
  type GetMobSessionSnapshotByMobIdPort,
} from 'src/realtime/mob-session';
import {
  GET_PLAYER_SESSION_SNAPSHOT_BY_CHARACTER_ID_PORT,
  type GetPlayerSessionSnapshotByCharacterIdPort,
} from 'src/realtime/player-session';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { EntityResolverPort } from '../ports/entity-resolver.port';

@Injectable()
export class EntityResolver implements EntityResolverPort {
  constructor(
    @Inject(GET_PLAYER_SESSION_SNAPSHOT_BY_CHARACTER_ID_PORT)
    private readonly getPlayerSessionSnapshotPort: GetPlayerSessionSnapshotByCharacterIdPort,
    @Inject(GET_MOB_SESSION_SNAPSHOT_BY_ID_PORT)
    private readonly getMobSessionSnapshotPort: GetMobSessionSnapshotByMobIdPort,
  ) {}

  public getByRef(ref: IEntityRef) {
    if (ref.type === 'player') {
      return this.getPlayerSessionSnapshotPort.execute(ref.id);
    } else if (ref.type === 'mob') {
      return this.getMobSessionSnapshotPort.execute(ref.id);
    }

    return null;
  }
}
