import { Socket } from 'socket.io';
import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';

import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(@Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort) {}

  public canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();

    if (!client.userData) {
      this.socketAdapter.onDisconnect(client);
      return false;
    }

    return true;
  }
}
