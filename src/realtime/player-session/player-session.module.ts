import { Module } from '@nestjs/common';

import { CONNECT_PLAYER_USE_CASE_TOKEN } from './application/ports/tokens';
import { ConnectPlayerUseCase } from './application/use-cases/connect-player.use-case';

@Module({
  providers: [{ provide: CONNECT_PLAYER_USE_CASE_TOKEN, useClass: ConnectPlayerUseCase }],
  exports: [CONNECT_PLAYER_USE_CASE_TOKEN],
})
export class PlayerSessionModule {}
