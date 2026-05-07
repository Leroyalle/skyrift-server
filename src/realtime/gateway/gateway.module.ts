import { SocketModule } from 'src/infrastructure/ws/socket.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CharacterModule } from 'src/modules/character/character.module';
import { UserModule } from 'src/modules/user/user.module';

import { Module } from '@nestjs/common';

import { ChatModule } from '../chat/chat.module';
import { ConnectionStatsModule } from '../connection-stats/connection-stats.module';
import { FlowModule } from '../flow/flow.module';
import { InteractionModule } from '../interaction/interaction.module';
import { PresenceModule } from '../presence/presence.module';

import {
  ENTER_WORLD_USE_CASE_TOKEN,
  HANDLE_CONNECTION_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { EnterWorldUseCase } from './application/use-cases/enter-world.use-case';
import { HandleConnectionUseCase } from './application/use-cases/handle-connection.use-case';
import { GameWsGateway } from './presentation/ws/game.ws.gateway';

@Module({
  imports: [
    FlowModule,
    InteractionModule,
    SocketModule,
    ChatModule,
    AuthModule,
    UserModule,
    CharacterModule,
    PresenceModule,
    ConnectionStatsModule,
  ],
  providers: [
    {
      provide: ENTER_WORLD_USE_CASE_TOKEN,
      useClass: EnterWorldUseCase,
    },
    {
      provide: HANDLE_CONNECTION_USE_CASE_TOKEN,
      useClass: HandleConnectionUseCase,
    },
    GameWsGateway,
  ],
})
export class GatewayModule {}
