import { SOCKET_ADAPTER_TOKEN, SocketAdapterPort } from 'src/infrastructure/ws';
import { AUTH_FACADE_TOKEN, AuthFacadePort } from 'src/modules/auth';
import { CHARACTER_FACADE_TOKEN, CharacterFacadePort } from 'src/modules/character';
import { USER_FACADE_TOKEN, UserFacadePort } from 'src/modules/user';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import { SocketKeys } from 'src/realtime/contracts/constants/socket-keys.constant';
import { BUILD_INITIAL_WORLD_STATE_USE_CASE, BuildInitialWorldStatePort } from 'src/realtime/flow';
import {
  CONNECTION_PRESENCE_ADAPTER_TOKEN,
  ConnectionPresenceAdapterPort,
} from 'src/realtime/presence';
import { AuthenticatedSocket } from 'src/realtime/shared/types/auth-socket.type';

import { Inject, Injectable } from '@nestjs/common';

import { HandleConnectionUseCasePort } from '../ports/handle-connaction.port';

export interface HandleConnectionPayload {
  client: AuthenticatedSocket;
}

@Injectable()
export class HandleConnectionUseCase implements HandleConnectionUseCasePort {
  constructor(
    @Inject(AUTH_FACADE_TOKEN) private readonly authFacade: AuthFacadePort,
    @Inject(CHARACTER_FACADE_TOKEN) private readonly characterFacade: CharacterFacadePort,
    @Inject(USER_FACADE_TOKEN) private readonly userFacade: UserFacadePort,
    @Inject(CONNECTION_PRESENCE_ADAPTER_TOKEN)
    private readonly connectionPresenceAdapter: ConnectionPresenceAdapterPort,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
    @Inject(BUILD_INITIAL_WORLD_STATE_USE_CASE)
    private readonly buildInitialWorldStateUseCase: BuildInitialWorldStatePort,
  ) {}

  public async execute(payload: HandleConnectionPayload) {
    const { token: accessToken, characterId } = payload.client.handshake.auth as {
      token?: string;
      characterId?: string;
    };

    if (!accessToken || !characterId) throw new Error('Access token or characterId not found');

    const data = await this.authFacade.verifyAccessToken(accessToken);
    const user = await this.userFacade.findOne(data.id);
    if (!user) throw new Error('User not found');
    const character = await this.characterFacade.findById(data.id, characterId);
    if (!character) throw new Error('Character not found');
    const oldClientId = await this.connectionPresenceAdapter.get(user.id);

    if (oldClientId) {
      const oldConnection = this.socketAdapter.getSocket(oldClientId);
      if (oldConnection && oldConnection.id !== payload.client.id) {
        // this.socketAdapter.sendToUser(user.id, ServerToClientEvents.Disconnect, {});
        this.socketAdapter.onDisconnect(oldConnection);
      }
    }

    await this.connectionPresenceAdapter.onConnect(user.id, payload.client.id);
    this.socketAdapter.onConnection(payload.client, user.id);

    this.socketAdapter.setClientUserData({
      userId: user.id,
      characterId: character.id,
      locationId: character.locationId,
      position: {
        x: character.x,
        y: character.y,
      },
    });

    const gameInitialData = await this.buildInitialWorldStateUseCase.execute({
      characterId,
      userId: user.id,
      locationId: character.locationId,
    });

    await this.socketAdapter.joinToRoom(
      character.userId,
      SocketKeys.Location + character.locationId,
    );

    this.socketAdapter.sendToUser(
      character.userId,
      ServerToClientEvents.GameInitialState,
      gameInitialData,
    );

    this.socketAdapter.broadcastToOthers(
      character.userId,
      RedisKeys.Location + character.locationId,
      ServerToClientEvents.PlayerJoined,
      gameInitialData.player,
    );

    this.socketAdapter.sendToUser(character.userId, ServerToClientEvents.PlayerConnected, {});
  }
}
