import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { LocationService } from 'src/world/location/location.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { GameInitialData } from 'src/game/types/game-initial-data.type';
import { PlayerStateService } from '../../characters/player-state/player-state.service';
import { AoeService } from '../../combat/services/aoe/aoe.service';
import { EntityRegistryService } from '../../entity-registry/entity-registry.service';

@Injectable()
export class GameInitialDataService {
  constructor(
    private readonly redisService: RedisService,
    private readonly playerStateService: PlayerStateService,
    private readonly registryService: EntityRegistryService,
    private readonly locationService: LocationService,
    private readonly aoeService: AoeService,
  ) {}

  public async loadInitialData(
    characterId: string,
    locationId: string,
  ): Promise<GameInitialData | undefined> {
    const character = this.playerStateService.getCharacterState(characterId);

    if (!character) return;

    const location = await this.locationService.loadLocation(locationId);

    if (!location) return;

    const otherPlayersIds = await this.redisService.smembers(
      RedisKeysFactory.locationPlayers(locationId),
    );

    const otherPlayers: IRuntimeCharacter[] = otherPlayersIds.reduce<IRuntimeCharacter[]>(
      (acc, id) => {
        const character = this.playerStateService.getCharacterState(id);
        if (character && character.id !== characterId) {
          acc.push(character);
        }
        return acc;
      },
      [],
    );

    const aoeZones = this.aoeService.getActiveAoeZones(character.locationId);

    const mobs = this.registryService.getEntitiesByLocation('mob', character.locationId);

    return {
      character,
      location,
      players: otherPlayers,
      aoeZones,
      mobs,
    };
  }
}
