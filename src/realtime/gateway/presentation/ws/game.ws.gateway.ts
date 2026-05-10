import { Namespace, Socket } from 'socket.io';
import { AuthSocket } from 'src/common/decorators/auth-socket.decorator';
import { WsAuthGuard } from 'src/common/guards/ws-guard.guard';
import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { SEND_MESSAGE_USE_CASE_TOKEN, type SendMessageUseCasePort } from 'src/realtime/chat';
import { GET_PING_USE_CASE_TOKEN, GetPingUseCasePort } from 'src/realtime/connection-stats';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'src/realtime/contracts/constants/socket-events.constant';
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

import { Inject, UseFilters, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { EnterWorldPort } from '../../application/ports/enter-world.port';
import { HandleConnectionUseCasePort } from '../../application/ports/handle-connaction.port';
import {
  ENTER_WORLD_USE_CASE_TOKEN,
  HANDLE_CONNECTION_USE_CASE_TOKEN,
} from '../../application/ports/tokens';
import { BaseWsExceptionFilter } from '../../infrastructure/ws/filters/base-ws-exception.filter';
import type { SendDirectMessageDto } from '../dto/chat/send-direct-message.dto';
import type { SendLocationMessageDto } from '../dto/chat/send-location-message.dto';
import type { SendWorldMessageDto } from '../dto/chat/send-world-message.dto';
import type { RequestAttackDto } from '../dto/request-attack.dto';
import type { RequestEquipItemDto } from '../dto/request-equip-item.dto';
import type { RequestMoveToDto } from '../dto/request-move-to.dto';
import type { RequestTalkToNpcDto } from '../dto/request-talk-to-npc.dto';
import type { RequestUnequipItemDto } from '../dto/request-unequip-item.dto';
import type { RequestUseItemDto } from '../dto/request-use-item.dto';
import type { RequestSkillUseDto } from '../dto/request-use-skill.dto';
import type { RequestUseTeleportDto } from '../dto/request-use-teleport.dto';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
@UseFilters(BaseWsExceptionFilter)
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
    @Inject(ENTER_WORLD_USE_CASE_TOKEN)
    private readonly enterWorldUseCase: EnterWorldPort,
    @Inject(HANDLE_CONNECTION_USE_CASE_TOKEN)
    private readonly handleConnectionUseCase: HandleConnectionUseCasePort,
    @Inject(GET_PING_USE_CASE_TOKEN) private readonly getPingUseCase: GetPingUseCasePort,
  ) {}

  @WebSocketServer()
  server!: Namespace;

  public afterInit(server: Namespace) {
    this.server = server;
    this.socketAdapter.setServer(server);
  }

  public handleConnection(client: Socket) {
    try {
      console.log('Client connected:', client.id);
      return this.handleConnectionUseCase.execute({ client });
    } catch (err) {
      client.disconnect();
      console.log('Handle connection error', err);
    }
  }

  public handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage(ClientToServerEvents.RequestInitialState)
  @UseGuards(WsAuthGuard)
  public getInitialState(@AuthSocket() client: AuthenticatedSocket) {
    return this.enterWorldUseCase.execute({
      characterId: client.userData.characterId,
      userId: client.userData.userId,
      locationId: client.userData.locationId,
    });
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
  @UseGuards(WsAuthGuard)
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
  @UseGuards(WsAuthGuard)
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
  @UseGuards(WsAuthGuard)
  public sendWorldMessage(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: SendWorldMessageDto,
  ) {
    return this.sendMessageUseCase.execute({
      message: input.message,
      senderId: client.userData.characterId,
      type: 'world',
    });
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendLocationMessage)
  @UseGuards(WsAuthGuard)
  public sendLocationMessage(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: SendLocationMessageDto,
  ) {
    console.log('location chat', input);
    return this.sendMessageUseCase.execute({
      message: input.message,
      senderId: client.userData.characterId,
      type: 'location',
    });
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendDirectMessage)
  @UseGuards(WsAuthGuard)
  public sendDirectMessage(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: SendDirectMessageDto,
  ) {
    return this.sendMessageUseCase.execute({
      message: input.message,
      senderId: client.userData.characterId,
      type: 'direct',
      // FIXME: передавать айдишку либо искать в юзкейсе по name
      receiverId: input.recipientName,
    });
  }

  @SubscribeMessage(ClientToServerEvents.PingTime)
  @UseGuards(WsAuthGuard)
  public sendPong(@AuthSocket() client: AuthenticatedSocket, @MessageBody() clientTime: number) {
    const serverTime = this.getPingUseCase.execute();
    client.emit(ServerToClientEvents.PongTime, {
      sendClientTime: clientTime,
      serverTime,
    });
  }
}
