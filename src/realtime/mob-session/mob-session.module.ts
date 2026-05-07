import { Module } from '@nestjs/common';

import { MobSessionFacade } from './application/facades/mob-session.facade';
import { MobSessionReader } from './application/facades/mob-session.reader';
import {
  GET_MOB_SESSION_SNAPSHOT_BY_ID_PORT,
  MOB_SESSION_FACADE_TOKEN,
  MOB_SESSION_READER_TOKEN,
  MOB_SESSION_REPOSITORY_TOKEN,
  SPAWN_MOB_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { GetMobSessionSnapshotByMobIdQuery } from './application/queries/get-snapshot-by-mob-id/get-mob-session-snapshot-by-mob-id.query';
import { SpawnMobSessionUseCase } from './application/use-cases/spawn-mob-session.use-case';
import { InMemoryMobSessionRepository } from './infrastructure/in-memory-mob-session.repository';

@Module({
  providers: [
    {
      provide: MOB_SESSION_REPOSITORY_TOKEN,
      useClass: InMemoryMobSessionRepository,
    },
    {
      provide: GET_MOB_SESSION_SNAPSHOT_BY_ID_PORT,
      useClass: GetMobSessionSnapshotByMobIdQuery,
    },
    {
      provide: MOB_SESSION_FACADE_TOKEN,
      useClass: MobSessionFacade,
    },
    {
      provide: MOB_SESSION_READER_TOKEN,
      useClass: MobSessionReader,
    },
    {
      provide: SPAWN_MOB_USE_CASE_TOKEN,
      useClass: SpawnMobSessionUseCase,
    },
  ],
  exports: [
    GET_MOB_SESSION_SNAPSHOT_BY_ID_PORT,
    MOB_SESSION_FACADE_TOKEN,
    MOB_SESSION_READER_TOKEN,
    SPAWN_MOB_USE_CASE_TOKEN,
  ],
})
export class MobSessionModule {}
