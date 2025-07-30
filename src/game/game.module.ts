import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CharacterModule } from 'src/character/character.module';
import { LocationModule } from 'src/location/location.module';
import { RedisModule } from 'src/redis/redis.module';
import { PlayerStateService } from './player-state.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CharacterModule,
    LocationModule,
    RedisModule,
  ],
  providers: [GameGateway, GameService, PlayerStateService],
})
export class GameModule {}
