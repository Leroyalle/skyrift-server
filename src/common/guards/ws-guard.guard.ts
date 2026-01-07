import { Socket } from 'socket.io';
import { SocketService } from 'src/game/services/socket/socket.service';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly socketService: SocketService) {}

  public canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();

    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return false;
    }

    return true;
  }
}
