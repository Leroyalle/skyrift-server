import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';

import { Inject, Injectable } from '@nestjs/common';

import { Message } from '../../domain/entities/message.entity';
import type { ChatRepositoryPort } from '../../domain/ports/chat-repository.port';
import { MessageType } from '../../domain/types/message.type';
import { MessageTextVo } from '../../domain/vo/message-text.vo';
import type {
  SendMessagePayload,
  SendMessageUseCasePort,
} from '../ports/send-message-use-case.port';
import { CHAT_REPOSITORY_TOKEN } from '../ports/tokens';

interface EmitMessagePayload {
  sender: PlayerSessionSnapshot;
  recipient?: PlayerSessionSnapshot;
  message: Message;
}

@Injectable()
export class SendMessageUseCase implements SendMessageUseCasePort {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepository: ChatRepositoryPort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
  ) {}

  public async execute(payload: SendMessagePayload) {
    const sender = this.entityResolver.getByRef({ type: 'player', id: payload.senderId });

    if (!sender) return;

    let recipient: PlayerSessionSnapshot | undefined;

    if (payload.receiverId) {
      const resolvedRecipient = this.entityResolver.getByRef({
        type: 'player',
        id: payload.receiverId,
      });

      if (!resolvedRecipient) return;

      recipient = resolvedRecipient;
    }

    const message = Message.create({
      message: MessageTextVo.create(payload.message),
      senderId: payload.senderId,
      type: payload.type,
      ts: this.clockService.nowMs(),
      senderName: sender.name,
    });

    const receiverId = this.getReceiverId(sender, payload.type, payload.receiverId);

    await this.chatRepository.add(message, receiverId);

    this.emitMessage({ sender, message, recipient });
  }

  private getReceiverId(
    sender: PlayerSessionSnapshot,
    type: MessageType,
    receiverId?: string,
  ): string | undefined {
    if (type === 'direct') return receiverId;
    if (type === 'location') return sender.position.locationId;
    return undefined;
  }

  private emitMessage(payload: EmitMessagePayload) {
    const messageData = payload.message.snapshot();
    if (messageData.type === 'direct') {
      if (!payload.recipient) throw new Error('Recipient is not found');
      this.socketAdapter.sendToUser(
        payload.sender.userId,
        ServerToClientEvents.ChatDirect,
        messageData,
      );

      this.socketAdapter.sendToUser(
        payload.recipient.userId,
        ServerToClientEvents.ChatDirect,
        messageData,
      );
    } else if (messageData.type === 'location') {
      this.socketAdapter.sendTo(
        RedisKeys.Location + payload.sender.position.locationId,
        ServerToClientEvents.ChatLocation,
        messageData,
      );
    } else if (messageData.type === 'world') {
      this.socketAdapter.broadcast(ServerToClientEvents.ChatWorld, messageData);
    }
  }
}
