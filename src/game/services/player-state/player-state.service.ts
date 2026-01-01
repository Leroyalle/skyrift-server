import { Injectable } from '@nestjs/common';
import { CharacterService } from 'src/characters/character/character.service';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { CachedLocation } from 'src/world/location/types/cashed-location.type';
import { Teleport } from 'src/world/location/types/teleport.type';
import { Character } from 'src/characters/character/entities/character.entity';
import { buildRuntimeCharacter } from './lib/build-runtime-character.lib';

@Injectable()
export class PlayerStateService {
  constructor(
    private readonly redisService: RedisService,
    private readonly characterService: CharacterService,
  ) {}

  private readonly playersStates: Map<string, IRuntimeCharacter> = new Map();

  public async join(character: Character) {
    console.log('[join]', character);

    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(character.locationId),
      character.id,
    );

    await this.redisService.set(RedisKeysFactory.playerNameToId(character.name), character.id);

    let runtimeCharacter = this.playersStates.get(character.id);

    if (!runtimeCharacter) {
      runtimeCharacter = buildRuntimeCharacter(character);
      this.playersStates.set(character.id, runtimeCharacter);
    }

    return runtimeCharacter;
  }

  public moveTo(
    character: IRuntimeCharacter,
    position: {
      x: number;
      y: number;
    },
    lastMoveAt: number,
  ) {
    character.x = position.x;
    character.y = position.y;
    character.lastMoveAt = lastMoveAt;
    return character;
  }

  public async leave(userId: string, playerId: string, locationId: string) {
    this.playersStates.delete(playerId);

    await this.redisService.srem(RedisKeysFactory.locationPlayers(locationId), playerId);

    await this.redisService.del(RedisKeysFactory.connectedPlayer(userId));
  }

  public async syncCharacterToDb(characterId: string) {
    const character = this.playersStates.get(characterId);

    if (!character) return;
    const {
      lastMoveAt: _,
      lastAttackAt: __,
      lastHpRegenerationTime: ___,
      isAttacking: ____,
      userId: _____,
      ...croppedCharacter
    } = character;

    await this.redisService.hset(RedisKeysFactory.playerState(characterId), character);

    await this.characterService.update(character.id, croppedCharacter);
    return character;
  }

  public getCharacterState(characterId: string) {
    return this.playersStates.get(characterId);
  }

  public getCharactersArray() {
    return Array.from(this.playersStates.values());
  }

  public changeUserLocation(
    playerState: IRuntimeCharacter,
    targetLocation: CachedLocation,
    teleport: Teleport,
  ) {
    playerState.locationId = targetLocation.id;
    playerState.x = teleport.targetX;
    playerState.y = teleport.targetY;
  }
}
