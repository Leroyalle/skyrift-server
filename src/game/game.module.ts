import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CharacterModule } from 'src/character/character.module';
import { LocationModule } from 'src/location/location.module';
import { RedisModule } from 'src/redis/redis.module';
import { PlayerStateService } from './player-state.service';
import { PathFindingModule } from './path-finding/path-finding.module';
import { CombatService } from './services/combat/combat.service';
import { SpatialGridService } from './services/spatial-grid/spatial-grid.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CharacterModule,
    LocationModule,
    RedisModule,
    PathFindingModule,
  ],
  providers: [
    GameGateway,
    GameService,
    PlayerStateService,
    CombatService,
    SpatialGridService,
  ],
})
export class GameModule {}
