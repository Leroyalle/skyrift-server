import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { CharacterService } from 'src/characters/character/character.service';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { BaseLogger } from 'src/common/infra/logger.infra';
import { TItem } from 'src/common/types/item.type';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { AuthenticatedSocket } from 'src/common/types/socket/auth-socket.type';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { UserService } from 'src/user/user.service';

import { Injectable } from '@nestjs/common';

import { RequestEquipDto } from './dto/equipment/request-equip.dto';
import { RequestUnEquipDto } from './dto/equipment/request-un-equip.dto';
import { RequestUseItemDto } from './dto/item/request-use-item.dto';
import { RequestAttackMoveDto } from './dto/request-attack-move.dto';
import { RequestMoveToDto } from './dto/request-move-to.dto';
import { RequestQuestAcceptDto } from './dto/request-quest-accept.dto';
import { RequestTalkToNpcDto } from './dto/request-talk-to-npc.dto';
import { RequestSkillUseDto } from './dto/request-use-skill.dto';
import { RequestUseTeleportDto } from './dto/request-use-teleport.dto';
import { PlayerStateService } from './services/characters/player-state/player-state.service';
import { InventoryService } from './services/characters/player-state/services/inventory/inventory.service';
import { RuntimeEquipmentService } from './services/characters/player-state/services/runtime-equipment/runtime-equipment.service';
import { ChatService } from './services/chat/chat.service';
import { DirectMessageInput } from './services/chat/dto/direct-message.input';
import { CombatService } from './services/combat/combat.service';
import { GameInitialDataService } from './services/game-core/game-initial-data/game-initial-data.service';
import { InteractionService } from './services/interaction/interaction.service';
import { MovementService } from './services/movement/movement.service';
import { SocketService } from './services/socket/socket.service';
import { SpatialGridService } from './services/spatial-grid/spatial-grid.service';
import { PongReturnData } from './types/pong-return-data.type';

@Injectable()
export class GameService extends BaseLogger {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly characterService: CharacterService,
    private readonly redisService: RedisService,
    private readonly playerStateService: PlayerStateService,
    private readonly movementService: MovementService,
    private readonly combatService: CombatService,
    private readonly socketService: SocketService,
    private readonly spatialGridService: SpatialGridService<IRuntimeCharacter>,
    private readonly interactionService: InteractionService,
    private readonly chatService: ChatService,
    private readonly gameInitialDataService: GameInitialDataService,
    private readonly inventoryService: InventoryService,
    private readonly equipmentService: RuntimeEquipmentService,
  ) {
    super();
  }

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

  public async requestMoveTo(client: AuthenticatedSocket, input: RequestMoveToDto) {
    await this.movementService.requestMoveTo(client, input);
  }

  public async requestAttackMove(client: Socket, input: RequestAttackMoveDto) {
    await this.combatService.requestAttackMoveForPlayer(client, input);
  }

  public async requestUseSkill(client: Socket, input: RequestSkillUseDto) {
    await this.combatService.requestUseSkill(client, input);
  }

  public requestAttackCancelled(client: Socket) {
    this.combatService.requestAttackCancelForPlayer(client);
  }

  public async requestUseTeleport(client: Socket, input: RequestUseTeleportDto) {
    await this.interactionService.requestUseTeleport(client, input);
  }

  public async playerSendWorldMessage(client: Socket, input: string) {
    return await this.chatService.sendWorldMessage(client, input);
  }

  public async playerSendLocationMessage(client: Socket, input: string) {
    return await this.chatService.sendLocationMessage(client, input);
  }
  public async playerSendDirectMessage(client: Socket, input: DirectMessageInput) {
    return await this.chatService.sendDirectMessage(client, input);
  }

  public sendPong(client: Socket, clientTime: number): PongReturnData | undefined {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    this.socketService.sendToUser(client.userData.userId, ServerToClientEvents.PongTime, {
      sendClientTime: clientTime,
      serverTime: Date.now(),
    });
  }

  public handleAddToBag(client: Socket, input: TItem) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    const character = this.playerStateService.getCharacterState(client.userData.characterId);

    if (!character) return;

    this.inventoryService.add(character.bag, input);

    this.socketService.sendToUser(client.userData.userId, ServerToClientEvents.BagItemAdded, input);
  }

  public handleEquip(client: AuthenticatedSocket, input: RequestEquipDto) {
    const character = this.playerStateService.getCharacterState(client.userData.characterId);
    if (!character) return;

    const result = this.equipmentService.equip(character.id, input.item, input.slot);

    if (!result.success) {
      this.socketService.sendToUser(character.userId, ServerToClientEvents.GameNotification, {
        type: 'error',
        message: result.error || 'Не удалось экипировать предмет',
      });
      return;
    }
    this.socketService.sendToUser(
      RedisKeys.Location + character.locationId,
      ServerToClientEvents.EquipmentEquipped,
      { characterId: character.id, item: input.item, slot: input.slot },
    );
  }

  public handleUnEquip(client: AuthenticatedSocket, input: RequestUnEquipDto) {
    const character = this.playerStateService.getCharacterState(client.userData.characterId);
    if (!character) return;

    const result = this.equipmentService.unEquip(character.id, input.slot);

    if (!result.success) {
      this.socketService.sendToUser(character.userId, ServerToClientEvents.GameNotification, {
        type: 'error',
        message: result.error || 'Не удалось снять предмет',
      });
      return;
    }

    this.socketService.sendToUser(
      RedisKeys.Location + character.locationId,
      ServerToClientEvents.EquipmentUnequipped,
      { characterId: character.id, slot: input.slot },
    );
  }

  public handleUseItem(client: AuthenticatedSocket, input: RequestUseItemDto) {
    return this.inventoryService.use(client.userData.characterId, input.itemId);
  }

  public async requestTalkToNpc(socket: AuthenticatedSocket, input: RequestTalkToNpcDto) {
    return await this.interactionService.requestTalkToNpc(socket, input);
  }

  public requestQuestAccept(socket: AuthenticatedSocket, input: RequestQuestAcceptDto) {
    return this.interactionService.requestQuestAccept(socket, input);
  }
}
