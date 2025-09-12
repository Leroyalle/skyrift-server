import { Injectable } from '@nestjs/common';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisService } from 'src/redis/redis.service';
import { SocketService } from '../socket/socket.service';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { PlayerStateService } from '../player-state/player-state.service';
import { Socket } from 'socket.io';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { DirectMessageInput } from './dto/direct-message.input';
import { MessageData } from './types/message-data.type';
import { DirectMessageData } from './types/direct-message-data.type';

@Injectable()
export class ChatService {
  constructor(
    private readonly redisService: RedisService,
    private readonly socketService: SocketService,
    private readonly playerStateService: PlayerStateService,
  ) {}

  // TODO: sync messages to DB

  public async sendWorldMessage(client: Socket, message: string) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }
    const sender = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    if (!sender) return;

    const ts = Date.now();

    const messageData: MessageData = {
      senderId: sender.id,
      senderName: sender.name,
      message,
      ts,
      type: 'world',
    };

    const redisKey = RedisKeysFactory.chatWorld();

    await this.redisService.lpush(redisKey, messageData);
    await this.redisService.ltrim(redisKey, 0, 99);

    this.socketService.broadcast(ServerToClientEvents.ChatWorld, messageData);
  }

  public async sendLocationMessage(client: Socket, message: string) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }
    const sender = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    if (!sender) return;

    const ts = Date.now();

    const messageData: MessageData = {
      senderId: sender.id,
      senderName: sender.name,
      message,
      ts,
      type: 'location',
    };

    const redisKey = RedisKeysFactory.chatLocation(sender.locationId);

    await this.redisService.lpush(redisKey, messageData);
    await this.redisService.ltrim(redisKey, 0, 99);

    this.socketService.sendTo(
      RedisKeys.Location + sender.locationId,
      ServerToClientEvents.ChatLocation,
      messageData,
    );
  }

  public async sendDirectMessage(client: Socket, input: DirectMessageInput) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }
    const sender = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    const recipientId = await this.redisService.get<string>(
      RedisKeysFactory.playerNameToId(input.recipientName),
    );

    if (!recipientId) return;

    const recipient = this.playerStateService.getCharacterState(recipientId);

    if (!sender || !recipient) return;

    const ts = Date.now();

    const directMessageData: DirectMessageData = {
      senderId: sender.id,
      senderName: sender.name,
      message: input.message,
      ts,
      type: 'direct',
      recipientId: input.recipientName,
    };

    const redisKey = RedisKeysFactory.chatDirect(
      sender.id,
      input.recipientName,
    );

    await this.redisService.lpush(redisKey, directMessageData);
    await this.redisService.ltrim(redisKey, 0, 99);

    const { recipientId: _, ...messageData } = directMessageData;

    this.socketService.sendToUser(
      recipient.userId,
      ServerToClientEvents.ChatDirect,
      messageData,
    );
  }
}
