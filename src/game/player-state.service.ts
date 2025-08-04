import { Injectable } from '@nestjs/common';
import { CharacterService } from 'src/character/character.service';
import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisService } from 'src/redis/redis.service';
import { parseLiveCharacterState } from './lib/parse-live-character-state.lib';
import { PathFindingService } from './path-finding/path-finding.service';

@Injectable()
export class PlayerStateService {
  private playersByLocation = new Map<
    string,
    Map<string, LiveCharacterState>
  >();

  constructor(
    private readonly redisService: RedisService,
    private readonly characterService: CharacterService,
    private readonly pathFindingService: PathFindingService,
  ) {}

  async join(player: LiveCharacterState, locationId: string) {
    const playerMap = this.getOrCreateLocationMap(locationId);
    playerMap.set(player.id, player);

    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(locationId),
      player.id,
    );

    await this.redisService.hset(RedisKeysFactory.playerState(player.id), {
      id: player.id,
      name: player.name,
      x: player.x,
      y: player.y,
      level: player.level,
      maxHp: player.maxHp,
      hp: player.hp,
      defense: player.defense,
      attackRange: player.attackRange,
      isAlive: player.isAlive,
      basePhysicalDamage: player.basePhysicalDamage,
      baseMagicDamage: player.baseMagicDamage,
      locationId: player.locationId,
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

  async syncCharacterToDb(characterId: string) {
    const findCharacter = await this.redisService.hgetAll(
      RedisKeysFactory.playerState(characterId),
    );

    console.log('[SYNC]', findCharacter);
    if (findCharacter && findCharacter.id) {
      await this.characterService.update(
        findCharacter.id,
        parseLiveCharacterState(findCharacter),
      );
    }
  }

  async attack(locationId: string, attackerId: string, victimId: string) {
    // const playersSet = this.playersByLocation.get(locationId);
    // const playersSet = await this.redisService.smembers(
    //   RedisKeysFactory.locationPlayers(locationId),
    // );

    // if (!playersSet) return;

    // const victim = playersSet.get(victimId);
    // const attacker = playersSet.get(attackerId);

    // if (victim && attacker) {
    //   // TODO: check character class - magic or physical
    //   victim.hp = Math.max(victim.hp - attacker.basePhysicalDamage);
    //   return { victim, attacker };
    // }

    const pipeline = this.redisService.pipeline();

    pipeline.hgetall(RedisKeysFactory.playerState(victimId));
    pipeline.hgetall(RedisKeysFactory.playerState(attackerId));

    const result = await pipeline.exec();

    if (!result || result.length < 2) return;
    const [victim, attacker] = result
      .filter(([err]) => !err)
      .map(([_, player]) =>
        parseLiveCharacterState(player as Record<string, string>),
      );
  }

  // async attack(
  //   attackerId: string,
  //   targetId: string,
  //   locationId: string,
  //   damage: number,
  // ): Promise<PlayerState | null> {
  //   const playerMap = this.playersByLocation.get(locationId);
  //   const target = playerMap?.get(targetId);

  //   if (target) {
  //     target.hp = Math.max(target.hp - damage, 0);
  //     return target;
  //   }

  //   const key = this.getPlayerKey(targetId);
  //   const newHp = await this.redis.incrby(key, 'hp', -damage);
  //   const state = await this.redis.hgetall(key);
  //   if (!state || !state.id) return null;

  //   return {
  //     id: state.id,
  //     name: state.name,
  //     x: parseInt(state.x),
  //     y: parseInt(state.y),
  //     hp: parseInt(state.hp),
  //     maxHp: 100,
  //     direction: state.direction as any,
  //     equipment: [],
  //   };
  // }

  // async syncToRedis(locationId: string) {
  //   const players = this.playersByLocation.get(locationId);
  //   if (!players) return;

  //   for (const [id, state] of players) {
  //     await this.redis.hset(this.getPlayerKey(id), {
  //       x: state.x,
  //       y: state.y,
  //       hp: state.hp,
  //       direction: state.direction,
  //     });
  //   }
  // }

  private getOrCreateLocationMap(
    locationId: string,
  ): Map<string, LiveCharacterState> {
    if (!this.playersByLocation.has(locationId)) {
      this.playersByLocation.set(locationId, new Map());
    }
    return this.playersByLocation.get(locationId)!;
  }
}
