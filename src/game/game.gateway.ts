import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { Namespace, Socket } from 'socket.io';
import { ClientToServerEvents } from 'src/common/enums/game-socket-events.enum';
import { RequestMoveToDto } from './dto/request-move-to.dto';
import { RequestAttackMoveDto } from './dto/request-attack-move.dto';
import { RequestSkillUseDto } from './dto/request-use-skill.dto';
import { SocketService } from './services/socket/socket.service';
import { RequestUseTeleportDto } from './dto/request-use-teleport.dto';
import { DirectMessageInput } from './services/chat/dto/direct-message.input';
import { TItem } from 'src/common/types/item.type';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/common/guards/ws-guard.guard';
import { AuthSocket } from 'src/common/decorators/auth-socket.decorator';
import { AuthenticatedSocket } from 'src/common/types/socket/auth-socket.type';
import { RequestEquipDto } from './dto/equipment/request-equip.dto';
import { RequestUnEquipDto } from './dto/equipment/request-un-equip.dto';
import { RequestUseItemDto } from './dto/item/request-use-item.dto';
import { RequestQuestAcceptDto } from './dto/request-quest-accept.dto';
import { RequestTalkToNpcDto } from './dto/request-talk-to-npc.dto';
import { GameConnectionService } from './services/game-core/game-connection/game-connection.service';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly socketService: SocketService,
    private readonly gameConnectionService: GameConnectionService,
  ) {}

  @WebSocketServer()
  server: Namespace;

  public afterInit(server: Namespace) {
    this.server = server;
    this.socketService.setServer(server);
  }

  public handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    return this.gameConnectionService.handleConnection(client);
  }

  public handleDisconnect(client: Socket) {
    return this.gameConnectionService.handleDisconnect(client);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerWalk)
  @UseGuards(WsAuthGuard)
  public playerWalk(
    @AuthSocket() client: AuthenticatedSocket,
    @MessageBody() input: RequestMoveToDto,
  ) {
    return this.gameService.requestMoveTo(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestAttackMove)
  public requestAttackMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() input: RequestAttackMoveDto,
  ) {
    return this.gameService.requestAttackMove(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseSkill)
  public requestUseSkill(
    @ConnectedSocket() client: Socket,
    @MessageBody() input: RequestSkillUseDto,
  ) {
    return this.gameService.requestUseSkill(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerAttackCancelled)
  public requestAttackCancalled(@ConnectedSocket() client: Socket) {
    return this.gameService.requestAttackCancelled(client);
  }

  @SubscribeMessage(ClientToServerEvents.RequestInitialState)
  @UseGuards(WsAuthGuard)
  public async handleInitialData(@AuthSocket() client: AuthenticatedSocket) {
    console.log('Client initial:', client.id);
    return await this.gameService.getInitialData(client);
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseTeleport)
  public async requestUseTeleport(client: Socket, input: RequestUseTeleportDto) {
    return await this.gameService.requestUseTeleport(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendWorldMessage)
  public async playerSendWorldMessage(client: Socket, input: string) {
    return await this.gameService.playerSendWorldMessage(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendLocationMessage)
  public async playerSendLocationMessage(client: Socket, input: string) {
    return await this.gameService.playerSendLocationMessage(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendDirectMessage)
  public async playerSendDirectMessage(client: Socket, input: DirectMessageInput) {
    return await this.gameService.playerSendDirectMessage(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PingTime)
  public sendPong(client: Socket, clientTime: number) {
    return this.gameService.sendPong(client, clientTime);
  }

  @SubscribeMessage(ClientToServerEvents.RequestBagAdd)
  public addToBag(client: Socket, input: TItem) {
    return this.gameService.handleAddToBag(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestEquipItem)
  @UseGuards(WsAuthGuard)
  public requestEquipItem(@AuthSocket() client: AuthenticatedSocket, input: RequestEquipDto) {
    console.log('EQUIP ITEM');
    return this.gameService.handleEquip(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestUnEquipItem)
  @UseGuards(WsAuthGuard)
  public requestUnEquipItem(@AuthSocket() client: AuthenticatedSocket, input: RequestUnEquipDto) {
    return this.gameService.handleUnEquip(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseItem)
  @UseGuards(WsAuthGuard)
  public requestUseItem(@AuthSocket() client: AuthenticatedSocket, input: RequestUseItemDto) {
    console.log('USE ITEM');
    return this.gameService.handleUseItem(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestTalkToNpc)
  @UseGuards(WsAuthGuard)
  public async requestTalkToNpc(
    @AuthSocket() socket: AuthenticatedSocket,
    @MessageBody() input: RequestTalkToNpcDto,
  ) {
    return await this.gameService.requestTalkToNpc(socket, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestAcceptQuest)
  @UseGuards(WsAuthGuard)
  public requestQuestAccept(
    @AuthSocket() socket: AuthenticatedSocket,
    @MessageBody() input: RequestQuestAcceptDto,
  ) {
    return this.gameService.requestQuestAccept(socket, input);
  }
}
