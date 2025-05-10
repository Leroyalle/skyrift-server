import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [
    GameGateway,
    GameService,
    {
      provide: 'SOCKET_IO_SERVER',
      useFactory: (gateway: GameGateway) => gateway.server,
      inject: [GameGateway],
    },
  ],
})
export class GameModule {}
