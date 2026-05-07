import { SocketModule } from 'src/infrastructure/ws/socket.module';
import { BagModule } from 'src/modules/bag/bag.module';
import { CharacterModule } from 'src/modules/character/character.module';
import { EffectModule } from 'src/modules/effect/effect.module';
import { EquipmentModule } from 'src/modules/equipment/equipment.module';
import { ItemModule } from 'src/modules/item/item.module';
import { LocationModule as LocationPersistenceModule } from 'src/modules/location/location.module';
import { MobModule } from 'src/modules/mob/mob.module';
import { NpcModule } from 'src/modules/npc/npc.module';
import { OwnedSkillModule } from 'src/modules/owned-skill/owned-skill.module';
import { QuestModule as QuestPersistenceModule } from 'src/modules/quest/quest.module';
import { SkillModule } from 'src/modules/skill/skill.module';
import { SpawnModule } from 'src/modules/spawn/spawn.module';

import { Module } from '@nestjs/common';

import { CombatModule } from '../combat/combat.module';
import { ContainerModule } from '../container/container.module';
import { EntityRegistryModule } from '../entity-registry/entity-registry.module';
import { LocationModule as LocationRealtimeModule } from '../location/location.module';
import { MobSessionModule } from '../mob-session/mob-session.module';
import { MovementModule } from '../movement/movement.module';
import { NpcSessionModule } from '../npc-session/npc-session.module';
import { PathFindingModule } from '../path-finding/path-finding.module';
import { PlayerSessionModule } from '../player-session/player-session.module';
import { PresenceModule } from '../presence/presence.module';
import { QuestModule as QuestRealtimeModule } from '../quest/quest.module';
import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';
import { SpatialGridModule } from '../spatial-grid/spatial-grid.module';

import {
  BOOTSTRAP_WORLD_USE_CASE_TOKEN,
  BUILD_INITIAL_WORLD_STATE_USE_CASE,
  BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN,
  BUILD_PLAYER_LOCATION_STATE_USE_CASE_TOKEN,
  CHANGE_PLAYER_LOCATION_USE_CASE_TOKEN,
  MANAGE_BAG_USE_CASE_TOKEN,
  MOVE_ITEM_USE_CASE_TOKEN,
  PROCESS_AI_TICK_USE_CASE_TOKEN,
  REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
  REQUEST_ATTACK_USE_CASE_TOKEN,
  REQUEST_MOVE_USE_CASE_TOKEN,
  REQUEST_USE_ITEM_USE_CASE_TOKEN,
  REQUEST_USE_SKILL_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { AiLeashService } from './application/services/ai/ai-leash.service';
import { AiLifecycleService } from './application/services/ai/ai-lifecycle.service';
import { AiPatrolService } from './application/services/ai/ai-patrol.service';
import { AiStateSyncService } from './application/services/ai/ai-state-sync.service';
import { AiTargetingService } from './application/services/ai/ai-targeting.service';
import { RuntimeBagLoader } from './application/services/loaders/runtime-bag-loader.service';
import { RuntimeEquipmentLoader } from './application/services/loaders/runtime-equipment-loader.service';
import { PlayerLocationTransitionService } from './application/services/player-location-transition.service';
import { ManageBagUseCase } from './application/use-cases/actions/manage-bag.use-case';
import { MoveItemUseCase } from './application/use-cases/actions/move-item.use-case';
import { RequestAttackCancelUseCase } from './application/use-cases/actions/request-attack-cancel.use-case';
import { RequestAttackUseCase } from './application/use-cases/actions/request-attack.use-case';
import { RequestMoveUseCase } from './application/use-cases/actions/request-move.use-case';
import { RequestUseItemUseCase } from './application/use-cases/actions/request-use-item.use-case';
import { RequestUseSkillUseCase } from './application/use-cases/actions/request-use-skill.use-case';
import { ProcessAiTickUseCase } from './application/use-cases/ai/process-mob-ai-tick.use-case';
import { BootstrapLocationsUseCase } from './application/use-cases/bootstrap/bootstrap-locations.use-case';
import { BootstrapMobsUseCase } from './application/use-cases/bootstrap/bootstrap-mobs.use-case';
import { BootstrapNpcsUseCase } from './application/use-cases/bootstrap/bootstrap-npcs.use-case';
import { BootstrapQuestsUseCase } from './application/use-cases/bootstrap/bootstrap-quests.use-case';
import { BootstrapWorldUseCase } from './application/use-cases/bootstrap/bootstrap-world.use-case';
import { BuildInitialWorldStateUseCase } from './application/use-cases/initial-state/build-initial-world-state.use-case';
import { BuildLocationWorldStateUseCase } from './application/use-cases/initial-state/build-location-world-state.use-case';
import { BuildPlayerLocationStateUseCase } from './application/use-cases/initial-state/build-player-location-state.use-case';
import { ChangePlayerLocationUseCase } from './application/use-cases/session/change-player-location.use-case';
import { InitializePlayerSessionUseCase } from './application/use-cases/session/initialize-player-session.use-case';

@Module({
  imports: [
    SocketModule,
    SpatialGridModule,
    PresenceModule,
    ContainerModule,
    PlayerSessionModule,
    LocationRealtimeModule,
    LocationPersistenceModule,
    CombatModule,
    EntityRegistryModule,
    MovementModule,
    PathFindingModule,
    MobSessionModule,
    MobModule,
    SpawnModule,
    NpcModule,
    NpcSessionModule,
    QuestPersistenceModule,
    QuestRealtimeModule,
    CharacterModule,
    OwnedSkillModule,
    SkillModule,
    EffectModule,
    BagModule,
    EquipmentModule,
    ItemModule,
  ],
  providers: [
    {
      provide: CHANGE_PLAYER_LOCATION_USE_CASE_TOKEN,
      useClass: ChangePlayerLocationUseCase,
    },
    {
      provide: BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN,
      useClass: BuildLocationWorldStateUseCase,
    },
    {
      provide: REQUEST_MOVE_USE_CASE_TOKEN,
      useClass: RequestMoveUseCase,
    },
    {
      provide: REQUEST_ATTACK_USE_CASE_TOKEN,
      useClass: RequestAttackUseCase,
    },
    {
      provide: REQUEST_USE_SKILL_USE_CASE_TOKEN,
      useClass: RequestUseSkillUseCase,
    },
    {
      provide: REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
      useClass: RequestAttackCancelUseCase,
    },
    {
      provide: REQUEST_USE_ITEM_USE_CASE_TOKEN,
      useClass: RequestUseItemUseCase,
    },
    {
      provide: MOVE_ITEM_USE_CASE_TOKEN,
      useClass: MoveItemUseCase,
    },
    {
      provide: MANAGE_BAG_USE_CASE_TOKEN,
      useClass: ManageBagUseCase,
    },
    {
      provide: PROCESS_AI_TICK_USE_CASE_TOKEN,
      useClass: ProcessAiTickUseCase,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
    PlayerLocationTransitionService,
    AiLeashService,
    AiLifecycleService,
    AiPatrolService,
    AiStateSyncService,
    AiTargetingService,
    // ПОКА БЕЗ ТОКЕНОВ И ПОРТОВ
    // STOPPED: добавить порты для initial-state юзкейсов и дальше подрубать модули, далее запустить фиксить ошибки + модуль auth
    BootstrapLocationsUseCase,
    BootstrapMobsUseCase,
    BootstrapNpcsUseCase,
    BootstrapQuestsUseCase,
    {
      provide: BOOTSTRAP_WORLD_USE_CASE_TOKEN,
      useClass: BootstrapWorldUseCase,
    },

    // BuildInitialWorldStateUseCase,

    {
      provide: BUILD_INITIAL_WORLD_STATE_USE_CASE,
      useClass: BuildInitialWorldStateUseCase,
    },
    {
      provide: BUILD_PLAYER_LOCATION_STATE_USE_CASE_TOKEN,
      useClass: BuildPlayerLocationStateUseCase,
    },
    InitializePlayerSessionUseCase,
    RuntimeBagLoader,
    RuntimeEquipmentLoader,
  ],
  exports: [
    CHANGE_PLAYER_LOCATION_USE_CASE_TOKEN,
    BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN,
    REQUEST_MOVE_USE_CASE_TOKEN,
    REQUEST_ATTACK_USE_CASE_TOKEN,
    REQUEST_USE_SKILL_USE_CASE_TOKEN,
    REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
    REQUEST_USE_ITEM_USE_CASE_TOKEN,
    MOVE_ITEM_USE_CASE_TOKEN,
    MANAGE_BAG_USE_CASE_TOKEN,
    PROCESS_AI_TICK_USE_CASE_TOKEN,
    BUILD_INITIAL_WORLD_STATE_USE_CASE,
    BOOTSTRAP_WORLD_USE_CASE_TOKEN,
  ],
})
export class FlowModule {}
