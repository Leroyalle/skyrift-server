import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import { SocketKeys } from 'src/realtime/contracts/constants/socket-keys.constant';
import {
  PLAYER_SESSION_FACADE_TOKEN,
  type PlayerSessionFacadePort,
  type PlayerSessionSnapshot,
} from 'src/realtime/player-session';
import {
  LOCATION_PRESENCE_ADAPTER_TOKEN,
  type LocationPresenceAdapterPort,
} from 'src/realtime/presence';
import { SPATIAL_GRID_INDEX_TOKEN, type SpatialGridIndexPort } from 'src/realtime/spatial-grid';

import { Inject, Injectable } from '@nestjs/common';

import type { ChangePlayerLocationInput } from '../ports/change-player-location-use-case.port';

@Injectable()
export class PlayerLocationTransitionService {
  constructor(
    @Inject(PLAYER_SESSION_FACADE_TOKEN)
    private readonly playerSessionFacade: PlayerSessionFacadePort,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
    @Inject(SPATIAL_GRID_INDEX_TOKEN) private readonly spatialGridIndex: SpatialGridIndexPort,
    @Inject(LOCATION_PRESENCE_ADAPTER_TOKEN)
    private readonly locationPresenceAdapter: LocationPresenceAdapterPort,
  ) {}

  public async execute(payload: ChangePlayerLocationInput) {
    this.socketAdapter.broadcastToOthers(
      payload.character.userId,
      SocketKeys.Location + payload.character.position.locationId,
      ServerToClientEvents.PlayerLeft,
      payload.character.id,
    );

    await this.locationPresenceAdapter.removePlayer(
      payload.character.id,
      payload.character.position.locationId,
    );

    await this.socketAdapter.leaveTheRoom(
      payload.character.userId,
      SocketKeys.Location + payload.character.position.locationId,
    );

    const prevPosition: PlayerSessionSnapshot['position'] = {
      locationId: payload.character.position.locationId,
      x: payload.character.position.x,
      y: payload.character.position.y,
    };

    this.playerSessionFacade.changeLocation(
      payload.character.id,
      payload.targetX,
      payload.targetY,
      payload.targetLocationId,
    );

    this.socketAdapter.setClientUserData({
      userId: payload.character.userId,
      characterId: payload.character.id,
      locationId: payload.targetLocationId,
      position: {
        x: payload.targetX,
        y: payload.targetY,
      },
    });

    await this.locationPresenceAdapter.addPlayer(payload.character.id, payload.targetLocationId);

    await this.socketAdapter.joinToRoom(
      payload.character.userId,
      SocketKeys.Location + payload.targetLocationId,
    );

    this.spatialGridIndex.update(
      {
        id: payload.character.id,
        locationId: payload.targetLocationId,
        type: payload.character.type,
        x: payload.targetX,
        y: payload.targetY,
      },
      prevPosition.locationId,
      prevPosition.x,
      prevPosition.y,
    );
  }
}
