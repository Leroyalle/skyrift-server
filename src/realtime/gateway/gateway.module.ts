import { SocketModule } from 'src/infrastructure/ws/socket.module';

import { Module } from '@nestjs/common';

import { ChatModule } from '../chat/chat.module';
import { FlowModule } from '../flow/flow.module';
import { InteractionModule } from '../interaction/interaction.module';

import { GameWsGateway } from './presentation/ws/game.ws.gateway';

@Module({
  imports: [FlowModule, InteractionModule, SocketModule, ChatModule],
  providers: [GameWsGateway],
})
export class GatewayModule {}
