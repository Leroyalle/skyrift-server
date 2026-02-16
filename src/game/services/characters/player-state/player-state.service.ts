import { CharacterService } from 'src/characters/character/character.service';
import { Character } from 'src/characters/character/entities/character.entity';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { PositionDto } from 'src/common/dto/position.dto';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { CachedLocation } from 'src/world/location/types/cashed-location.type';
import { Teleport } from 'src/world/location/types/teleport.type';

import { Injectable } from '@nestjs/common';

import { EntityRegistryService } from '../../entity-registry/entity-registry.service';

import { buildRuntimeCharacter } from './lib/build-runtime-character.lib';

@Injectable()
export class PlayerStateService {
  constructor(
    private readonly redisService: RedisService,
    private readonly characterService: CharacterService,
    private readonly registryService: EntityRegistryService,
  ) {}

  // private readonly playersStates: Map<string, IRuntimeCharacter> = new Map();

  public async join(character: Character) {
    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(character.locationId),
      character.id,
    );

    await this.redisService.set(RedisKeysFactory.playerNameToId(character.name), character.id);

    let runtimeCharacter = this.registryService.getByRef({ type: 'player', id: character.id });
    console.log('chharacter bag dda', runtimeCharacter?.bag);
    if (!runtimeCharacter) {
      runtimeCharacter = buildRuntimeCharacter(character);
      this.registryService.add(runtimeCharacter);
    }

    return runtimeCharacter;
  }

  public moveTo(character: IRuntimeCharacter, position: PositionDto, lastMoveAt: number) {
    character.x = position.x;
    character.y = position.y;
    character.lastMoveAt = lastMoveAt;
    return character;
  }

  public async leave(userId: string, playerId: string, locationId: string) {
    this.registryService.remove({
      type: 'player',
      id: playerId,
      locationId,
    });

    await this.redisService.srem(RedisKeysFactory.locationPlayers(locationId), playerId);

    await this.redisService.del(RedisKeysFactory.connectedPlayer(userId));
  }

  public async syncCharacterToDb(characterId: string) {
    const character = this.registryService.getByRef({
      type: 'player',
      id: characterId,
    });

    if (!character) return;
    const {
      lastMoveAt: _,
      lastAttackAt: __,
      lastHpRegenerationTime: ___,
      isAttacking: ____,
      userId: _____,
      bag: ______,
      ...croppedCharacter
    } = character;

    // console.log('charac lenght', croppedCharacter.bag.items.length);
    await this.redisService.hset(RedisKeysFactory.playerState(characterId), character);

    await this.characterService.update(character.id, croppedCharacter);
    return character;
  }

  public getCharacterState(characterId: string): IRuntimeCharacter | undefined {
    return this.registryService.getByRef({ type: 'player', id: characterId });
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
