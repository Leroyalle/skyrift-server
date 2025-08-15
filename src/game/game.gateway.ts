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
import { ChangeLocationDto } from './dto/change-location.dto';
import { RequestMoveToDto } from './dto/request-move-to.dto';
import { RequestAttackMoveDto } from './dto/request-attack-move.dto';
import { RequestSkillUseDto } from './dto/request-use-skill.dto';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer()
  server: Namespace;

  afterInit(server: Namespace) {
    this.server = server;
    this.gameService.setServer(server);
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
    // this.gameService.playerWalk(client, input);
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
  requestAttackCancalled(
    @ConnectedSocket() client: Socket,
    @MessageBody() input: RequestAttackMoveDto,
  ) {
    return this.gameService.requestAttackCancelled(client, input);
  }

  @SubscribeMessage(ClientToServerEvents.RequestInitialState)
  async handleInitialData(client: Socket) {
    console.log('Client initial:', client.id);
    return await this.gameService.getInitialData(client);
  }

  @SubscribeMessage(ClientToServerEvents.ChangeLocation)
  async handleChangeLocation(client: Socket, input: ChangeLocationDto) {
    return await this.gameService.changeLocation(client, input);
  }
}
