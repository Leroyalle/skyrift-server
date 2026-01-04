import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CharacterService } from 'src/characters/character/character.service';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { AuthenticatedSocket } from 'src/common/types/socket/auth-socket.type';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { UserService } from 'src/user/user.service';
import { SocketService } from '../../socket/socket.service';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { PlayerStateService } from '../../characters/player-state/player-state.service';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { SpatialGridService } from '../../spatial-grid/spatial-grid.service';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { GameInitialDataService } from '../game-initial-data/game-initial-data.service';
import { Socket } from 'socket.io';

@Injectable()
export class GameConnectionService {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly characterService: CharacterService,
    private readonly playerStateService: PlayerStateService,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
    private readonly spatialGridService: SpatialGridService<IRuntimeCharacter>,
    private readonly gameInitialDataService: GameInitialDataService,
  ) {}

  public async handleConnection(client: Socket) {
    try {
      const { token: accessToken, characterId } = client.handshake.auth as {
        token?: string;
        characterId?: string;
      };

      if (!accessToken || !characterId) {
        console.log('Disconnect by token or character ID');
        client.disconnect();
        return;
      }

      let payload: JwtPayload;
      try {
        payload = this.authService.verifyToken(accessToken, 'access');
      } catch (e) {
        console.log('Token verification failed', e);
        client.disconnect();
        return;
      }
      const findUser = await this.userService.findOne(payload.sub);
      if (!findUser) {
        console.log('Disconnect by findUser');
        client.disconnect();
        return;
      }

      const findCharacter = await this.characterService.findOwnedCharacter(
        findUser.id,
        characterId,
      );
      if (!findCharacter) {
        console.log('Disconnect by findCharacter');
        client.disconnect();
        return;
      }

      const oldClientId = (await this.redisService.get(
        RedisKeys.ConnectedPlayers + findUser.id,
      )) as string;

      await this.redisService.set(RedisKeys.ConnectedPlayers + findUser.id, client.id);

      this.socketService.onConnection(client, findUser.id);

      if (oldClientId) {
        const oldConnection = this.socketService.getSocket(oldClientId);
        if (oldConnection && oldConnection.id !== client.id) {
          this.socketService.notifyDisconnection(
            oldConnection,
            'Другое устройство подключилось к игре',
          );
          this.socketService.onDisconnect(oldConnection);
        }
      }

      this.socketService.setClientUserData(
        findUser.id,
        findCharacter.id,
        findCharacter.location.id,
        {
          x: findCharacter.x,
          y: findCharacter.y,
        },
      );

      const runtimeCharacter = await this.playerStateService.join(findCharacter);

      this.spatialGridService.add(runtimeCharacter);

      await this.socketService.joinToRoom(
        runtimeCharacter.userId,
        RedisKeys.Location + runtimeCharacter.locationId,
      );

      this.socketService.sendToUser(
        runtimeCharacter.userId,
        ServerToClientEvents.PlayerConnected,
        runtimeCharacter,
      );

      this.socketService.broadcastToOthers(
        client,
        RedisKeys.Location + runtimeCharacter.locationId,
        ServerToClientEvents.PlayerJoined,
        runtimeCharacter,
      );

      console.log(`Client ${client.id} joined location:`, findCharacter.location.id);
      // FIXME: send initial data
    } catch (error) {
      console.log('Disconnect by catch in handleConnection', error);
      client.disconnect(true);
    }
  }

  public async handleDisconnect(client: Socket) {
    if (!this.socketService.verifyUserDataInSocket(client)) return;

    // FIXME: очищать в другом месте имея доступ к ключ
    // this.combatService.deletePendingAction(client.userData.characterId);

    const characterState = await this.playerStateService.syncCharacterToDb(
      client.userData.characterId,
    );

    // FIXME: replace to characterState.[]
    await this.playerStateService.leave(
      client.userData.userId,
      client.userData.characterId,
      client.userData.locationId,
    );

    if (characterState) this.spatialGridService.remove(characterState);

    this.socketService.broadcastToOthers(
      client,
      RedisKeys.Location + client.userData.locationId,
      ServerToClientEvents.PlayerLeft,
      client.userData.characterId,
    );

    console.log('Client disconnected:', client.id);
  }

  public async getInitialData(client: AuthenticatedSocket) {
    console.log('initial data to client', client.id);

    const { userId, characterId, locationId } = client['userData'];
    const storedClientId = await this.redisService.get(RedisKeys.ConnectedPlayers + userId);

    if (storedClientId !== client.id) {
      this.socketService.notifyDisconnection(client);
      console.log('Disconnect by storedClientId');
      client.disconnect();
      return;
    }

    const initialData = await this.gameInitialDataService.loadInitialData(characterId, locationId);

    if (!initialData) {
      this.socketService.onDisconnect(client);
      this.socketService.notifyDisconnection(client, 'Initial data is not found');
      return;
    }

    await this.socketService.joinToRoom(userId, RedisKeys.Location + initialData.location.id);

    this.socketService.sendToUser(userId, ServerToClientEvents.GameInitialState, initialData);
  }
}
