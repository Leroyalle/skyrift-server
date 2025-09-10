import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CharacterService } from 'src/character/character.service';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { LocationService } from 'src/location/location.service';
import { RedisService } from 'src/redis/redis.service';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { RequestMoveToDto } from './dto/request-move-to.dto';
import { PlayerStateService } from './services/player-state/player-state.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RequestAttackMoveDto } from './dto/request-attack-move.dto';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { RequestSkillUseDto } from './dto/request-use-skill.dto';
import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { MovementService } from './services/movement/movement.service';
import { CombatService } from './services/combat/combat.service';
import { RegenerationService } from './services/regeneration/regeneration.service';
import { SocketService } from './services/socket/socket.service';
import { SpatialGridService } from './services/spatial-grid/spatial-grid.service';
import { RequestUseTeleportDto } from './dto/request-use-teleport.dto';
import { InteractionService } from './services/interaction/interaction.service';
import { ChatService } from './services/chat/chat.service';
import { DirectMessageInput } from './services/chat/dto/direct-message.input';

@Injectable()
export class GameService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly characterService: CharacterService,
    private readonly redisService: RedisService,
    private readonly playerStateService: PlayerStateService,
    private readonly movementService: MovementService,
    private readonly combatService: CombatService,
    private readonly regenerationService: RegenerationService,
    private readonly socketService: SocketService,
    private readonly spatialGridService: SpatialGridService<LiveCharacter>,
    private readonly locationService: LocationService,
    private readonly interactionService: InteractionService,
    private readonly chatService: ChatService,
  ) {}

  private readonly logger = new Logger(GameService.name);

  private gameTickInterval: NodeJS.Timeout;
  private lastTickTimeMovement = 0;
  private lastTickTimeActions = 0;
  private lastTickTimeAoE = 0;
  private lastTickTimeRegeneration = 0;
  private lastTickTimeInteraction = 0;

  private readonly intervalMovement = 150;
  private readonly intervalActions = 200;
  private readonly intervalAoE = 200;
  private readonly intervalRegeneration = 1000;
  private readonly intervalInteraction = 300;

  onModuleInit() {
    this.gameTickInterval = setInterval(() => {
      try {
        void this.tick();
      } catch (error) {
        this.logger.error(`Error in game tick: ${error.message}`);
      }
    }, 150);
  }

  onModuleDestroy() {
    clearInterval(this.gameTickInterval);
  }

  private async tick() {
    const now = Date.now();

    if (now - this.lastTickTimeMovement >= this.intervalMovement) {
      this.movementService.tickMovement();
      this.lastTickTimeMovement = now;
    }
    if (now - this.lastTickTimeActions >= this.intervalActions) {
      await this.combatService.tickActions();
      this.lastTickTimeActions = now;
    }

    if (now - this.lastTickTimeAoE >= this.intervalAoE) {
      this.combatService.tickAoE();
      this.lastTickTimeAoE = now;
    }

    if (now - this.lastTickTimeRegeneration >= this.intervalRegeneration) {
      this.regenerationService.tickRegeneration();
      this.lastTickTimeRegeneration = now;
    }

    if (now - this.lastTickTimeInteraction >= this.intervalInteraction) {
      await this.interactionService.tickInteractions();
      this.lastTickTimeInteraction = now;
    }
  }

  async handleConnection(client: Socket) {
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

      await this.redisService.set(
        RedisKeys.ConnectedPlayers + findUser.id,
        client.id,
      );

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

      const liveCharacter: LiveCharacter = {
        ...findCharacter,
        lastMoveAt: 0,
        lastAttackAt: 0,
        lastHpRegenerationTime: 0,
        locationId: findCharacter.location.id,
        userId: findCharacter.user.id,
        isAttacking: false,
        currentTarget: null,
      };

      await this.playerStateService.join(
        liveCharacter,
        findCharacter.location.id,
      );

      this.spatialGridService.add(liveCharacter);

      await this.socketService.joinToRoom(
        findCharacter.user.id,
        RedisKeys.Location + findCharacter.location.id,
      );

      this.socketService.sendToUser(
        findCharacter.user.id,
        ServerToClientEvents.PlayerConnected,
        findCharacter,
      );

      this.socketService.broadcastToOthers(
        client,
        RedisKeys.Location + findCharacter.locationId,
        ServerToClientEvents.PlayerJoined,
        findCharacter,
      );

      console.log(
        `Client ${client.id} joined location:`,
        findCharacter.location.id,
      );
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

  // FIXME: replace to handle connection
  public async getInitialData(client: Socket) {
    console.log('initial data to client', client.id);
    if (!this.socketService.verifyUserDataInSocket(client)) {
      console.log('Disconnect by verifyUserDataInSocket');
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    const { userId, characterId, locationId } = client['userData'];
    const storedClientId = await this.redisService.get(
      RedisKeys.ConnectedPlayers + userId,
    );

    if (storedClientId !== client.id) {
      this.logger.warn(`Invalid connection for user ${userId}`);
      this.socketService.notifyDisconnection(client);
      console.log('Disconnect by storedClientId');
      client.disconnect();
      return;
    }

    const findCharacter = await this.characterService.findOwnedCharacter(
      userId,
      characterId,
    );

    if (!findCharacter) {
      this.socketService.onDisconnect(client);
      this.socketService.notifyDisconnection(client, 'Character not found');
      return;
    }

    const findLocation = await this.locationService.loadLocation(locationId);

    if (!findLocation) {
      this.socketService.notifyDisconnection(client, 'Location not found');
      this.socketService.onDisconnect(client);
      return;
    }

    const playersIds = await this.redisService.smembers(
      RedisKeysFactory.locationPlayers(locationId),
    );

    const otherPlayers: LiveCharacter[] = playersIds.reduce<LiveCharacter[]>(
      (acc, id) => {
        const character = this.playerStateService.getCharacterState(id);
        if (character && character.id !== characterId) {
          acc.push(character);
        }
        return acc;
      },
      [],
    );

    const aoeZones = this.combatService.getActiveAoeZones(
      findCharacter.locationId,
    );
    console.log('initialZones', aoeZones);
    await this.socketService.joinToRoom(
      userId,
      RedisKeys.Location + findLocation.id,
    );

    this.socketService.sendToUser(
      userId,
      ServerToClientEvents.GameInitialState,
      {
        character: findCharacter,
        location: findLocation,
        players: otherPlayers,
        aoeZones,
      },
    );
  }

  public async requestMoveTo(client: Socket, input: RequestMoveToDto) {
    await this.movementService.requestMoveTo(client, input);
  }

  public async requestAttackMove(client: Socket, input: RequestAttackMoveDto) {
    await this.combatService.requestAttackMove(client, input);
  }

  public async requestUseSkill(client: Socket, input: RequestSkillUseDto) {
    await this.combatService.requestUseSkill(client, input);
  }

  public requestAttackCancelled(client: Socket) {
    this.combatService.requestAttackCancel(client);
  }

  public async requestUseTeleport(
    client: Socket,
    input: RequestUseTeleportDto,
  ) {
    await this.interactionService.requestUseTeleport(client, input);
  }

  public async playerSendWorldMessage(client: Socket, input: string) {
    return await this.chatService.sendWorldMessage(client, input);
  }

  public async playerSendLocationMessage(client: Socket, input: string) {
    return await this.chatService.sendLocationMessage(client, input);
  }
  public async playerSendDirectMessage(
    client: Socket,
    input: DirectMessageInput,
  ) {
    return await this.chatService.sendDirectMessage(client, input);
  }
}
