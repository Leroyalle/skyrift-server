import { Namespace, Socket } from 'socket.io';
import { AuthSocket } from 'src/common/decorators/auth-socket.decorator';
import { WsAuthGuard } from 'src/common/guards/ws-guard.guard';
import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { SEND_MESSAGE_USE_CASE_TOKEN, type SendMessageUseCasePort } from 'src/realtime/chat';
import { ClientToServerEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import {
  MOVE_ITEM_USE_CASE_TOKEN,
  type MoveItemPort,
  REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
  REQUEST_ATTACK_USE_CASE_TOKEN,
  REQUEST_MOVE_USE_CASE_TOKEN,
  REQUEST_USE_ITEM_USE_CASE_TOKEN,
  REQUEST_USE_SKILL_USE_CASE_TOKEN,
  type RequestAttackCancelPort,
  type RequestAttackPort,
  type RequestMovePort,
  type RequestUseItemPort,
  type RequestUseSkillPort,
} from 'src/realtime/flow';
import {
  REQUEST_TALK_TO_NPC_USE_CASE_TOKEN,
  REQUEST_USE_TELEPORT_USE_CASE_TOKEN,
  type RequestTalkToNpcPort,
  type RequestUseTeleportPort,
} from 'src/realtime/interaction';
import type { AuthenticatedSocket } from 'src/realtime/shared/types/auth-socket.type';

import { Inject, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import type { SendDirectMessageDto } from '../../dto/chat/send-direct-message.dto';
import type { SendLocationMessageDto } from '../../dto/chat/send-location-message.dto';
import type { SendWorldMessageDto } from '../../dto/chat/send-world-message.dto';
import type { RequestAttackDto } from '../../dto/request-attack.dto';
import type { RequestEquipItemDto } from '../../dto/request-equip-item.dto';
import type { RequestMoveToDto } from '../../dto/request-move-to.dto';
import type { RequestTalkToNpcDto } from '../../dto/request-talk-to-npc.dto';
import type { RequestUnequipItemDto } from '../../dto/request-unequip-item.dto';
import type { RequestUseItemDto } from '../../dto/request-use-item.dto';
import type { RequestSkillUseDto } from '../../dto/request-use-skill.dto';
import type { RequestUseTeleportDto } from '../../dto/request-use-teleport.dto';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class GameWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
    @Inject(REQUEST_MOVE_USE_CASE_TOKEN)
    private readonly requestMoveUseCase: RequestMovePort,
    @Inject(REQUEST_ATTACK_USE_CASE_TOKEN) private readonly requestAttackUseCase: RequestAttackPort,
    @Inject(REQUEST_USE_SKILL_USE_CASE_TOKEN)
    private readonly requestUseSkillUseCase: RequestUseSkillPort,
    @Inject(REQUEST_USE_ITEM_USE_CASE_TOKEN)
    private readonly requestUseItemUseCase: RequestUseItemPort,
    @Inject(REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN)
    private readonly requestAttackCancelUseCase: RequestAttackCancelPort,
    @Inject(MOVE_ITEM_USE_CASE_TOKEN) private readonly moveItemUseCase: MoveItemPort,
    @Inject(REQUEST_TALK_TO_NPC_USE_CASE_TOKEN)
    private readonly requestTalkToNpcUseCase: RequestTalkToNpcPort,
    @Inject(REQUEST_USE_TELEPORT_USE_CASE_TOKEN)
    private readonly requestUseTeleportUseCase: RequestUseTeleportPort,
    @Inject(SEND_MESSAGE_USE_CASE_TOKEN)
    private readonly sendMessageUseCase: SendMessageUseCasePort,
  ) {}

  @WebSocketServer()
  server!: Namespace;

  public afterInit(server: Namespace) {
    this.server = server;
    this.socketAdapter.setServer(server);
  }

  public handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  public handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerWalk)
  @UseGuards(WsAuthGuard)
  public requestMoveTo(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestMoveToDto,
  ) {
    return this.requestMoveUseCase.execute({
      characterId: client.userData.characterId,
      targetTile: { x: input.targetX, y: input.targetY },
      userId: client.userData.userId,
    });
  }

  @SubscribeMessage(ClientToServerEvents.RequestAttackMove)
  @UseGuards(WsAuthGuard)
  public requestAttackMove(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestAttackDto,
  ) {
    return this.requestAttackUseCase.execute({
      characterId: client.userData.characterId,
      locationId: client.userData.locationId,
      userId: client.userData.userId,
      target: { id: input.id, type: input.type },
    });
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseSkill)
  @UseGuards(WsAuthGuard)
  public requestUseSkill(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestSkillUseDto,
  ) {
    return this.requestUseSkillUseCase.execute({
      characterId: client.userData.characterId,
      skillId: input.skillId,
      target:
        input.type === 'target'
          ? { kind: 'target', value: input.targetRef }
          : { kind: 'aoe', value: input.area },
    });
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseItem)
  @UseGuards(WsAuthGuard)
  public requestUseItem(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestUseItemDto,
  ) {
    return this.requestUseItemUseCase.execute({
      characterId: client.userData.characterId,
      itemId: input.itemId,
    });
  }

  @SubscribeMessage(ClientToServerEvents.PlayerAttackCancelled)
  @UseGuards(WsAuthGuard)
  public requestAttackCancel(@AuthSocket() client: AuthenticatedSocket) {
    return this.requestAttackCancelUseCase.execute({ characterId: client.userData.characterId });
  }

  @SubscribeMessage(ClientToServerEvents.RequestEquipItem)
  @UseGuards(WsAuthGuard)
  public equip(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestEquipItemDto,
  ) {
    return this.moveItemUseCase.moveFromBagToEquipment({
      characterId: client.userData.characterId,
      slot: input.slot,
      itemId: input.itemId,
    });
  }

  @SubscribeMessage(ClientToServerEvents.RequestUnEquipItem)
  @UseGuards(WsAuthGuard)
  public unequip(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestUnequipItemDto,
  ) {
    return this.moveItemUseCase.moveFromEquipmentToBag({
      characterId: client.userData.characterId,
      slot: input.slot,
    });
  }

  @SubscribeMessage(ClientToServerEvents.RequestTalkToNpc)
  public requestTalkToNpc(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestTalkToNpcDto,
  ) {
    return this.requestTalkToNpcUseCase.execute({
      characterId: client.userData.characterId,
      locationId: client.userData.locationId,
      npcId: input.npcId,
    });
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseTeleport)
  public requestUseTeleport(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestUseTeleportDto,
  ) {
    return this.requestUseTeleportUseCase.execute({
      characterId: client.userData.characterId,
      pointerX: input.pointerX,
      pointerY: input.pointerY,
      teleportId: input.teleportId,
    });
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendWorldMessage)
  public sendWorldMessage(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: SendWorldMessageDto,
  ) {
    return this.sendMessageUseCase.execute({
      message: input.message,
      senderId: client.userData.userId,
      type: 'world',
    });
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendLocationMessage)
  public sendLocationMessage(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: SendLocationMessageDto,
  ) {
    return this.sendMessageUseCase.execute({
      message: input.message,
      senderId: client.userData.userId,
      type: 'location',
    });
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendWorldMessage)
  public sendDirectMessage(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: SendDirectMessageDto,
  ) {
    return this.sendMessageUseCase.execute({
      message: input.message,
      senderId: client.userData.userId,
      type: 'world',
    });
  }
}
