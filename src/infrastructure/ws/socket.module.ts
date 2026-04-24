import { Module } from '@nestjs/common';

import { SOCKET_ADAPTER_TOKEN } from './application/ports/tokens';
import { SocketConnectionRepository } from './infrastructure/socket-connection.repository';
import { SocketAdapter } from './infrastructure/socket.adapter';

@Module({
  providers: [
    SocketConnectionRepository,
    {
      provide: SOCKET_ADAPTER_TOKEN,
      useClass: SocketAdapter,
    },
  ],
  exports: [SOCKET_ADAPTER_TOKEN],
})
export class SocketModule {}
