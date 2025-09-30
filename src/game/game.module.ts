import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CharacterModule } from 'src/character/character.module';
import { LocationModule } from 'src/location/location.module';
import { RedisModule } from 'src/redis/redis.module';
import { PlayerStateService } from './services/player-state/player-state.service';
import { CombatService } from './services/combat/combat.service';
import { SpatialGridService } from './services/spatial-grid/spatial-grid.service';
import { SocketService } from './services/socket/socket.service';
import { MovementService } from './services/movement/movement.service';
import { RegenerationService } from './services/regeneration/regeneration.service';
import { InteractionService } from './services/interaction/interaction.service';
import { PathFindingService } from './services/path-finding/path-finding.service';
import { ChatService } from './services/chat/chat.service';
import { RuntimeMobService } from './services/runtime-mob/runtime-mob.service';
import { MobModule } from 'src/mob/mob.module';
import { MobSpawnModule } from 'src/mob/mob-spawn/mob-spawn.module';
import { EffectModule } from 'src/effect/effect.module';
import { AoeService } from './services/combat/services/aoe/aoe.service';
import { RuntimeEntityService } from './services/runtime-entity/runtime-entity.service';
import { ActionQueueService } from './services/combat/services/action-queue/action-queue.service';
import { GameInitialDataService } from './services/game-initial-data/game-initial-data.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CharacterModule,
    LocationModule,
    RedisModule,
    MobModule,
    MobSpawnModule,
    EffectModule,
  ],
  providers: [
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
    RuntimeEntityService,
    ActionQueueService,
    GameInitialDataService,
  ],
})
export class GameModule {}
