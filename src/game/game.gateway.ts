import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { PlayerWalkDto } from './dto/player-walk.dto';
import { Server, Socket } from 'socket.io';

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

  @SubscribeMessage('player:walk')
  playerWalk(@MessageBody() walkInput: PlayerWalkDto) {
    return this.gameService.playerWalk(walkInput);
  }
}
