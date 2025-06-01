import { Injectable, Logger } from '@nestjs/common';
import { PlayerWalkDto } from './dto/player-walk.dto';
import { Namespace, Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CharacterService } from 'src/character/character.service';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events';
import { ChangeLocationDto } from './dto/change-location.dto';
import { LocationService } from 'src/location/location.service';
import { PlayerData } from 'src/common/types/player-data.type';

@Injectable()
export class GameService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly characterService: CharacterService,
    private readonly locationService: LocationService,
  ) {}

  private server: Namespace;

  setServer(server: Namespace) {
    this.server = server;
  }

  private readonly logger = new Logger(GameService.name);
  private readonly activeConnections: Map<string, string> = new Map();

  // FIXME:
  private readonly locationCache;

  async handleConnection(client: Socket) {
    try {
      const { token: accessToken, characterId } = client.handshake.auth as {
        token?: string;
        characterId?: string;
      };

      if (!accessToken || !characterId) {
        client.disconnect();
        console.log('Disconnect by token or character ID');
        return;
      }

      let payload;
      try {
        payload = this.authService.verifyToken(accessToken, 'access');
      } catch (e) {
        console.log('Token verification failed', e);
        client.disconnect();
        return;
      }
      const findUser = await this.userService.findOne(payload.sub);
      if (!findUser) {
        client.disconnect();
        console.log('Disconnect by findUser');
        return;
      }

      const findCharacter = await this.characterService.findOwnedCharacter(
        findUser.id,
        characterId,
      );
      if (!findCharacter) {
        client.disconnect();
        console.log('Disconnect by findCharacter');
        return;
      }

      const oldClientId = this.activeConnections.get(findUser.id);

      this.activeConnections.set(findUser.id, client.id);
      console.log('oldClientId', oldClientId, 'newClientId', client.id);

      if (oldClientId && oldClientId !== client.id) {
        console.log('before oldConnection');
        console.log('Sockets keys:', this.server.sockets.keys());
        console.log('oldClientId', oldClientId);

        if (this.server.sockets.has(oldClientId)) {
          const oldConnection = this.server.sockets.get(oldClientId);
          if (oldConnection) {
            if (oldConnection.id === client.id) {
              console.warn('⚠️ Attempting to disconnect self!');
            } else {
              console.log(
                `Disconnecting old client for user ${findUser.id}: ${oldClientId}`,
              );
              console.log('before oldConnection.disconnect');
              oldConnection.disconnect(true);
            }
          }
        }
      }

      if (!client.userData) {
        client.userData = {};
        console.log('userData', findCharacter);
      }
      client.userData = {
        userId: findUser.id,
        characterId: findCharacter.id,
        locationId: findCharacter.location.id,
        position: findCharacter.position,
      };

      void client.join(`location:${findCharacter.location.id}`);
      this.server.emit(ServerToClientEvents.PlayerConnected, findCharacter);
    } catch {
      client.disconnect(true);
    }
  }

  public async getInitialData(client: Socket) {
    console.log('initial data to client');
    if (!this.verifyUserDataInSocket(client)) {
      client.disconnect();
      return;
    }

    const { userId, characterId, locationId } = client['userData'];
    const storedClientId = this.activeConnections.get(userId);
    if (storedClientId !== client.id) {
      this.logger.warn(`Invalid connection for user ${userId}`);
      client.disconnect();
      return;
    }

    const findCharacter = await this.characterService.findOwnedCharacter(
      userId,
      characterId,
    );
    if (!findCharacter) {
      client.disconnect();
      return;
    }

    const findLocation = await this.locationService.findOne(
      findCharacter.location.id,
    );
    if (!findLocation) {
      client.disconnect();
      return;
    }

    const otherPlayers: PlayerData[] = [];
    const sockets = await this.server.in(`location:${locationId}`).allSockets();
    for (const socketId of sockets) {
      const otherClient = this.server?.sockets?.get?.(socketId);
      if (
        otherClient &&
        otherClient.id !== client.id &&
        this.verifyUserDataInSocket(otherClient)
      ) {
        otherPlayers.push({
          userId: otherClient.userData.userId,
          characterId: otherClient.userData.characterId,
          position: otherClient.userData.position,
        });
      }
    }
    console.log('initial data to client');
    void client.join(`location:${findCharacter.location.id}`);
    console.log('initial data to client', {
      character: findCharacter,
      location: findLocation,
      players: otherPlayers,
    });
    client.emit(ServerToClientEvents.GameInitialState, {
      character: findCharacter,
      location: findLocation,
      players: otherPlayers,
    });
  }

  public playerWalk(client: Socket, input: PlayerWalkDto) {
    if (!this.verifyUserDataInSocket(client)) {
      client.disconnect();
      return;
    }

    console.log('position', input);

    const { userId, characterId, locationId } = client['userData'];
    const storedClientId = this.activeConnections.get(userId);
    if (storedClientId !== client.id) {
      this.logger.warn(`Invalid connection for user ${userId}`);
      client.disconnect();
      return;
    }

    this.server
      .to(`location:${locationId}`)
      .emit(ServerToClientEvents.PlayerWalk, {
        userId,
        characterId,
        locationId,
        position: input.position,
      });
  }

  public async changeLocation(client: Socket, input: ChangeLocationDto) {
    if (!this.verifyUserDataInSocket(client)) {
      client.disconnect();
      return;
    }
    const {
      userId,
      characterId,
      locationId: oldLocationId,
    } = client['userData'];
    const storedClientId = this.activeConnections.get(userId);
    if (storedClientId !== client.id) {
      this.logger.warn(`Invalid connection for user ${userId}`);
      client.disconnect();
      return;
    }

    // TODO: проверить локацию на соседство

    const findLocation = await this.locationService.findOne(
      input.nextLocationId,
    );

    if (!findLocation) {
      client.disconnect();
      return;
    }

    if (findLocation.id === input.nextLocationId) {
      return;
    }

    void client.leave(`location:${oldLocationId}`);
    void client.join(`location:${input.nextLocationId}`);

    this.server
      .to(`location:${oldLocationId}`)
      .emit(ServerToClientEvents.PlayerLeft, {
        characterId,
      });

    this.server
      .to(`location:${input.nextLocationId}`)
      .emit(ServerToClientEvents.PlayerLeft, {
        characterId,
        position: {
          x: 20,
          y: 20,
        },
      });
  }

  private verifyUserDataInSocket(client: Socket): client is Socket & {
    userData: PlayerData;
  } {
    const userData = client.userData;
    if (
      !userData ||
      !userData.userId ||
      !userData.characterId ||
      !userData.locationId ||
      !userData.position
    ) {
      return false;
    }
    return true;
  }
}
