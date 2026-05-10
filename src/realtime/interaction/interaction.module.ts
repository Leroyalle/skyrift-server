import { SocketModule } from 'src/infrastructure/ws/socket.module';

import { Module } from '@nestjs/common';

import { EntityRegistryModule } from '../entity-registry/entity-registry.module';
import { FlowModule } from '../flow/flow.module';
import { LocationModule } from '../location/location.module';
import { MovementModule } from '../movement/movement.module';
import { QuestModule } from '../quest/quest.module';

import {
  INTERACTION_REPOSITORY_TOKEN,
  INTERACTION_RESOLVER_SERVICE_TOKEN,
  PROCESS_INTERACTION_TICK_TOKEN,
  REQUEST_TALK_TO_NPC_USE_CASE_TOKEN,
  REQUEST_USE_TELEPORT_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { InteractionResolverService } from './application/services/interaction-resolver.service';
import { NpcInteractionService } from './application/services/npc-interaction.service';
import { TeleportInteractionService } from './application/services/teleport-interaction.service';
import { ProcessInteractionTickUseCase } from './application/use-cases/process-interaction-tick.use-case';
import { RequestTalkToNpcUseCase } from './application/use-cases/request-talk-to-npc.use-case';
import { RequestUseTeleportUseCase } from './application/use-cases/request-use-teleport.use-case';
import { InMemoryInteractionRepository } from './infrastructure/repositories/in-memory-interaction.repository';

@Module({
  imports: [
    MovementModule,
    LocationModule,
    EntityRegistryModule,
    MovementModule,
    QuestModule,
    SocketModule,
    FlowModule,
  ],
  providers: [
    {
      provide: INTERACTION_REPOSITORY_TOKEN,
      useClass: InMemoryInteractionRepository,
    },
    {
      provide: INTERACTION_RESOLVER_SERVICE_TOKEN,
      useClass: InteractionResolverService,
    },
    {
      provide: REQUEST_TALK_TO_NPC_USE_CASE_TOKEN,
      useClass: RequestTalkToNpcUseCase,
    },
    {
      provide: REQUEST_USE_TELEPORT_USE_CASE_TOKEN,
      useClass: RequestUseTeleportUseCase,
    },
    {
      provide: PROCESS_INTERACTION_TICK_TOKEN,
      useClass: ProcessInteractionTickUseCase,
    },
    NpcInteractionService,
    TeleportInteractionService,
  ],
  exports: [
    REQUEST_TALK_TO_NPC_USE_CASE_TOKEN,
    REQUEST_USE_TELEPORT_USE_CASE_TOKEN,
    PROCESS_INTERACTION_TICK_TOKEN,
  ],
})
export class InteractionModule {}
