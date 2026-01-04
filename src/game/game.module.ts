import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CharacterModule } from 'src/characters/character/character.module';
import { LocationModule } from 'src/world/location/location.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { PlayerStateService } from './services/characters/player-state/player-state.service';
import { CombatService } from './services/combat/combat.service';
import { SpatialGridService } from './services/spatial-grid/spatial-grid.service';
import { SocketService } from './services/socket/socket.service';
import { MovementService } from './services/movement/movement.service';
import { RegenerationService } from './services/regeneration/regeneration.service';
import { InteractionService } from './services/interaction/interaction.service';
import { PathFindingService } from './services/path-finding/path-finding.service';
import { ChatService } from './services/chat/chat.service';
import { MobModule } from 'src/characters/mob/mob.module';
import { EffectModule } from 'src/effect/effect.module';
import { AoeService } from './services/combat/services/aoe/aoe.service';
import { ActionQueueService } from './services/combat/services/action-queue/action-queue.service';
import { GameLoopService } from './services/game-core/game-loop/game-loop.service';
import { GameInitialDataService } from './services/game-core/game-initial-data/game-initial-data.service';
import { RuntimeEffectService } from './services/runtime-effect/runtime-effect.service';
import { ProjectileService } from './services/combat/services/projectile/projectile.service';
import { MovementQueueService } from './services/movement/services/movement-queue/movement-queue.service';
import { BagModule } from 'src/characters/character/bag/bag.module';
import { InventoryService } from './services/characters/player-state/services/inventory/inventory.service';
import { WsAuthGuard } from 'src/common/guards/ws-guard.guard';
import { RuntimeEquipmentService } from './services/characters/player-state/services/runtime-equipment/runtime-equipment.service';
import { RuntimeMobService } from './services/characters/runtime-mob/runtime-mob.service';
import { RuntimeQuestService } from './services/interaction/services/runtime-quest/runtime-quest.service';
import { RuntimeNpcService } from './services/characters/runtime-npc/runtime-npc.service';
import { EntityRegistryService } from './services/entity-registry/entity-registry.service';
import { WorldBootstrapService } from './services/game-core/world-bootstrap/world-bootstrap.service';
import { GameConnectionService } from './services/game-core/game-connection/game-connection.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CharacterModule,
    LocationModule,
    RedisModule,
    MobModule,
    EffectModule,
    BagModule,
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
  ],
})
export class GameModule {}
