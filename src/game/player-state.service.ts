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

  private readonly playersStates: Map<string, LiveCharacterState> = new Map();

  async join(player: LiveCharacterState, locationId: string) {
    console.log('[join]', player);
    const playerMap = this.getOrCreateLocationMap(locationId);
    playerMap.set(player.id, player);

    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(locationId),
      player.id,
    );

    const cachedPlayer = await this.redisService.hgetAll(
      RedisKeysFactory.playerState(player.id),
    );

    if (!cachedPlayer) return;

    const parsedPlayer = parseLiveCharacterState(cachedPlayer);

    if (!this.playersStates.has(parsedPlayer.id)) {
      this.playersStates.set(parsedPlayer.id, {
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
        attackSpeed: player.attackSpeed,
        lastMoveAt: player.lastMoveAt,
        lastAttackAt: player.lastAttackAt,
        lastHpRegenerationTime: player.lastHpRegenerationTime,
        userId: player.userId,
        isAttacking: false,
      });
    }
  }

  public moveTo(
    characterId: string,
    position: {
      x: number;
      y: number;
    },
    lastMoveAt: number,
  ) {
    const character = this.playersStates.get(characterId);
    if (!character) return;
    character.x = position.x;
    character.y = position.y;
    character.lastMoveAt = lastMoveAt;
  }

  async leave(userId: string, playerId: string, locationId: string) {
    this.playersStates.delete(playerId);

    await this.redisService.srem(
      RedisKeysFactory.locationPlayers(locationId),
      playerId,
    );

    await this.redisService.del(RedisKeysFactory.connectedPlayer(userId));
  }

  async syncCharacterToDb(characterId: string) {
    const playerState = this.playersStates.get(characterId);

    console.log('[SYNC]', playerState);
    if (playerState && playerState.id) {
      const {
        lastMoveAt: _,
        lastAttackAt: __,
        lastHpRegenerationTime: ___,
        isAttacking: ____,
        userId: _____,
        ...croppedCharacter
      } = playerState;

      await this.redisService.hset(
        RedisKeysFactory.playerState(characterId),
        playerState,
      );

      await this.characterService.update(playerState.id, croppedCharacter);
    }
  }

  public getCharacterState(characterId: string) {
    return this.playersStates.get(characterId);
  }

  public getCharactersArray() {
    return Array.from(this.playersStates.values());
  }

  public attack(attackerId: string, victimId: string, now: number) {
    const attacker = this.playersStates.get(attackerId);
    const victim = this.playersStates.get(victimId);

    if (!attacker || !victim || attacker.locationId !== victim.locationId)
      return;

    // TODO: calculate received damage with defense and other stats
    const receivedDamage = attacker.basePhysicalDamage;
    console.log('receivedDamage', receivedDamage);
    const remainingHp = Math.max(victim.hp - receivedDamage, 0);
    const isAlive = remainingHp !== 0;

    victim.hp = remainingHp;
    victim.isAlive = isAlive;

    attacker.lastAttackAt = now;

    return {
      characterId: victim.id,
      hp: remainingHp,
      isAlive,
      receivedDamage,
    };
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
