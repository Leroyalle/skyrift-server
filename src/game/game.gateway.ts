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
  ) {}

  @WebSocketServer()
  server: Namespace;

  afterInit(server: Namespace) {
    this.server = server;
    this.socketService.setServer(server);
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    return this.gameService.handleConnection(client);
  }

  handleDisconnect(client: Socket) {
    return this.gameService.handleDisconnect(client);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerWalk)
  playerWalk(
    @ConnectedSocket() client: Socket,
    @MessageBody() input: RequestMoveToDto,
  ) {
    return this.gameService.requestMoveTo(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestAttackMove)
  requestAttackMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() input: RequestAttackMoveDto,
  ) {
    return this.gameService.requestAttackMove(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseSkill)
  requestUseSkill(
    @ConnectedSocket() client: Socket,
    @MessageBody() input: RequestSkillUseDto,
  ) {
    return this.gameService.requestUseSkill(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerAttackCancelled)
  requestAttackCancalled(@ConnectedSocket() client: Socket) {
    return this.gameService.requestAttackCancelled(client);
  }

  @SubscribeMessage(ClientToServerEvents.RequestInitialState)
  async handleInitialData(client: Socket) {
    console.log('Client initial:', client.id);
    return await this.gameService.getInitialData(client);
  }

  @SubscribeMessage(ClientToServerEvents.RequestUseTeleport)
  async requestUseTeleport(client: Socket, input: RequestUseTeleportDto) {
    return await this.gameService.requestUseTeleport(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendWorldMessage)
  async playerSendWorldMessage(client: Socket, input: string) {
    return await this.gameService.playerSendWorldMessage(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendLocationMessage)
  async playerSendLocationMessage(client: Socket, input: string) {
    return await this.gameService.playerSendLocationMessage(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerSendWorldMessage)
  async playerSendDirectMessage(client: Socket, input: DirectMessageInput) {
    return await this.gameService.playerSendDirectMessage(client, input);
  }
}
