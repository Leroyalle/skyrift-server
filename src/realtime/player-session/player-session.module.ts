import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';

import { PlayerSessionFacade } from './application/facades/player-session.facade';
import { PlayerSessionReader } from './application/facades/player-session.reader';
import {
  CONNECT_PLAYER_USE_CASE_TOKEN,
  GET_PLAYER_SESSION_SNAPSHOT_BY_CHARACTER_ID_TOKEN,
  PLAYER_SESSION_FACADE_TOKEN,
  PLAYER_SESSION_READER_TOKEN,
  PLAYER_SESSION_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { GetPlayerSessionSnapshotByCharacterIdQuery } from './application/queries/get-snapshot-by-character-id/get-player-session-snapshot-by-character-id.query';
import { ConnectPlayerUseCase } from './application/use-cases/connect-player.use-case';
import { InMemoryPlayerSessionRepository } from './infrastructure/repositories/in-memory-player-session.repository';

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: CONNECT_PLAYER_USE_CASE_TOKEN, useClass: ConnectPlayerUseCase },
    {
      provide: PLAYER_SESSION_REPOSITORY_TOKEN,
      useClass: InMemoryPlayerSessionRepository,
    },
    {
      provide: GET_PLAYER_SESSION_SNAPSHOT_BY_CHARACTER_ID_TOKEN,
      useClass: GetPlayerSessionSnapshotByCharacterIdQuery,
    },
    {
      provide: PLAYER_SESSION_FACADE_TOKEN,
      useClass: PlayerSessionFacade,
    },
    {
      provide: PLAYER_SESSION_READER_TOKEN,
      useClass: PlayerSessionReader,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
  exports: [
    CONNECT_PLAYER_USE_CASE_TOKEN,
    GET_PLAYER_SESSION_SNAPSHOT_BY_CHARACTER_ID_TOKEN,
    PLAYER_SESSION_FACADE_TOKEN,
    PLAYER_SESSION_READER_TOKEN,
  ],
})
export class PlayerSessionModule {}
