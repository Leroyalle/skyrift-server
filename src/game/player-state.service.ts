import { Injectable } from '@nestjs/common';
import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PlayerStateService {
  private playersByLocation = new Map<
    string,
    Map<string, LiveCharacterState>
  >();

  constructor(private readonly redisService: RedisService) {}

  async join(player: LiveCharacterState, locationId: string) {
    const playerMap = this.getOrCreateLocationMap(locationId);
    playerMap.set(player.id, player);

    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(locationId),
      player.id,
    );

    await this.redisService.set(RedisKeysFactory.playerState(player.id), {
      id: player.id,
      name: player.name,
      position: {
        x: player.position.x,
        y: player.position.y,
      },
      hp: player.hp,
      maxHp: player.maxHp,
      defense: player.defense,
      isAlive: player.isAlive,
      attackRange: player.attackRange,
      level: player.level,
    } as LiveCharacterState);
  }

  async leave(userId: string, playerId: string, locationId: string) {
    const playerMap = this.playersByLocation.get(locationId);
    playerMap?.delete(playerId);

    await this.redisService.srem(
      RedisKeysFactory.locationPlayers(locationId),
      playerId,
    );
    await this.redisService.del(RedisKeysFactory.playerState(playerId));

    await this.redisService.del(RedisKeysFactory.connectedPlayer(userId));
  }

  private getOrCreateLocationMap(
    locationId: string,
  ): Map<string, LiveCharacterState> {
    if (!this.playersByLocation.has(locationId)) {
      this.playersByLocation.set(locationId, new Map());
    }
    return this.playersByLocation.get(locationId)!;
  }
}
