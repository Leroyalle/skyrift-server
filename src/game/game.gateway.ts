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
import { PlayerWalkDto } from './dto/player-walk.dto';
import { Server, Socket } from 'socket.io';
import { ClientToServerEvents } from 'src/common/enums/game-socket-events';
import { ChangeLocationDto } from './dto/change-location.dto';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    return this.gameService.handleConnection(client);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage(ClientToServerEvents.PlayerWalk)
  playerWalk(
    @ConnectedSocket() client: Socket,
    @MessageBody() walkInput: PlayerWalkDto,
  ) {
    this.gameService.playerWalk(client, walkInput);
  }

  @SubscribeMessage(ClientToServerEvents.RequestInitialState)
  async handleInitialData(client: Socket) {
    await this.gameService.getInitialData(client);
  }

  @SubscribeMessage(ClientToServerEvents.ChangeLocation)
  async handleChangeLocation(client: Socket, input: ChangeLocationDto) {
    await this.gameService.changeLocation(client, input);
  }
}
