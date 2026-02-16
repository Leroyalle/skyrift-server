import { AuthModule } from 'src/auth/auth.module';
import { BagModule } from 'src/characters/character/bag/bag.module';
import { CharacterModule } from 'src/characters/character/character.module';
import { MobModule } from 'src/characters/mob/mob.module';
import { WsAuthGuard } from 'src/common/guards/ws-guard.guard';
import { EffectModule } from 'src/effect/effect.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { BaseItem } from 'src/item/entities/item.entity';
import { ItemModule } from 'src/item/item.module';
import { QuestModule } from 'src/quest/quest.module';
import { UserModule } from 'src/user/user.module';
import { LocationModule } from 'src/world/location/location.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { PlayerStateService } from './services/characters/player-state/player-state.service';
import { InventoryService } from './services/characters/player-state/services/inventory/inventory.service';
import { RuntimeEquipmentService } from './services/characters/player-state/services/runtime-equipment/runtime-equipment.service';
import { RuntimeMobService } from './services/characters/runtime-mob/runtime-mob.service';
import { RuntimeNpcService } from './services/characters/runtime-npc/runtime-npc.service';
import { ChatService } from './services/chat/chat.service';
import { CombatService } from './services/combat/combat.service';
import { ActionQueueService } from './services/combat/services/action-queue/action-queue.service';
import { AoeService } from './services/combat/services/aoe/aoe.service';
import { CombatCalculationService } from './services/combat/services/combat-calculation/combat-calculation.service';
import { ProjectileService } from './services/combat/services/projectile/projectile.service';
import { EntityRegistryService } from './services/entity-registry/entity-registry.service';
import { GameConnectionService } from './services/game-core/game-connection/game-connection.service';
import { GameInitialDataService } from './services/game-core/game-initial-data/game-initial-data.service';
import { GameLoopService } from './services/game-core/game-loop/game-loop.service';
import { WorldBootstrapService } from './services/game-core/world-bootstrap/world-bootstrap.service';
import { InteractionService } from './services/interaction/interaction.service';
import { QuestIndexService } from './services/interaction/services/quest/quest-index/quest-index.service';
import { RuntimeQuestService } from './services/interaction/services/quest/runtime-quest/runtime-quest.service';
import { LootInteractionService } from './services/loot/loot-interaction.service';
import { LootRuntimeService } from './services/loot/loot-runtime.service';
import { LootService } from './services/loot/loot.service';
import { MovementService } from './services/movement/movement.service';
import { MovementQueueService } from './services/movement/services/movement-queue/movement-queue.service';
import { PathFindingService } from './services/path-finding/path-finding.service';
import { RegenerationService } from './services/regeneration/regeneration.service';
import { RuntimeEffectService } from './services/runtime-effect/runtime-effect.service';
import { SocketService } from './services/socket/socket.service';
import { SpatialGridService } from './services/spatial-grid/spatial-grid.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BaseItem]),
    AuthModule,
    UserModule,
    CharacterModule,
    LocationModule,
    RedisModule,
    MobModule,
    EffectModule,
    BagModule,
    QuestModule,
    ItemModule,
  ],
  providers: [
    WsAuthGuard,
    GameGateway,
    GameService,
    PlayerStateService,
    MovementService,
    CombatService,
    SpatialGridService,
    SocketService,
    PathFindingService,
    RegenerationService,
    InteractionService,
    ChatService,
    RuntimeMobService,
    AoeService,
    ActionQueueService,
    GameInitialDataService,
    RuntimeEffectService,
    GameLoopService,
    ProjectileService,
    MovementQueueService,
    InventoryService,
    RuntimeEquipmentService,
    RuntimeQuestService,
    RuntimeNpcService,
    EntityRegistryService,
    WorldBootstrapService,
    GameConnectionService,
    QuestIndexService,
    LootRuntimeService,
    LootService,
    LootInteractionService,
    CombatCalculationService,
  ],
})
export class GameModule {}
