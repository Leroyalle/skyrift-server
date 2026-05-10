import { SOCKET_ADAPTER_TOKEN, SocketAdapterPort } from 'src/infrastructure/ws';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import { SocketKeys } from 'src/realtime/contracts/constants/socket-keys.constant';
import { BUILD_INITIAL_WORLD_STATE_USE_CASE, BuildInitialWorldStatePort } from 'src/realtime/flow';

import { Inject, Injectable } from '@nestjs/common';

import { EnterWorldPort } from '../ports/enter-world.port';

interface GetInitialStatePayload {
  characterId: string;
  userId: string;
  locationId: string;
  position: { x: number; y: number };
}

@Injectable()
export class EnterWorldUseCase implements EnterWorldPort {
  constructor(
    @Inject(BUILD_INITIAL_WORLD_STATE_USE_CASE)
    private readonly buildInitialWorldStateUseCase: BuildInitialWorldStatePort,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
  ) {}

  public async execute(payload: GetInitialStatePayload) {
    const gameInitialData = await this.buildInitialWorldStateUseCase.execute({
      characterId: payload.characterId,
      userId: payload.userId,
      locationId: payload.locationId,
    });

    this.socketAdapter.sendToUser(
      payload.userId,
      ServerToClientEvents.GameInitialState,
      gameInitialData,
    );

    this.socketAdapter.setClientUserData({
      userId: payload.userId,
      characterId: payload.characterId,
      locationId: payload.locationId,
      position: { x: payload.position.x, y: payload.position.y },
    });

    await this.socketAdapter.joinToRoom(payload.userId, SocketKeys.Location + payload.locationId);

    this.socketAdapter.sendToUser(
      payload.userId,
      ServerToClientEvents.GameInitialState,
      gameInitialData,
    );

    this.socketAdapter.broadcastToOthers(
      payload.userId,
      RedisKeys.Location + payload.locationId,
      ServerToClientEvents.PlayerJoined,
      gameInitialData.player,
    );

    // this.socketAdapter.sendToUser(payload.userId, ServerToClientEvents.PlayerConnected, {});
  }
}
