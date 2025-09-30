import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { PlayerStateService } from '../player-state/player-state.service';
import { RuntimeMobService } from '../runtime-mob/runtime-mob.service';
import { LocationService } from 'src/location/location.service';
import { AoeService } from '../combat/services/aoe/aoe.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { IRuntimeCharacter } from 'src/character/types/runtime-character';
import { GameInitialData } from 'src/game/types/game-initial-data.type';

@Injectable()
export class GameInitialDataService {
  constructor(
    private readonly redisService: RedisService,
    private readonly playerStateService: PlayerStateService,
    private readonly runtimeMobService: RuntimeMobService,
    private readonly locationService: LocationService,
    private readonly aoeService: AoeService,
  ) {}

  public async gameInitialData(
    characterId: string,
    locationId: string,
  ): Promise<GameInitialData | undefined> {
    const character = this.playerStateService.getCharacterState(characterId);

    if (!character) return;

    const location = await this.locationService.loadLocation(locationId);

    if (!location) return;

    const otherPlayersIds = await this.redisService.smembers(
      RedisKeysFactory.locationPlayers(characterId),
    );

    const otherPlayers: IRuntimeCharacter[] = otherPlayersIds.reduce<
      IRuntimeCharacter[]
    >((acc, id) => {
      const character = this.playerStateService.getCharacterState(id);
      if (character && character.id !== characterId) {
        acc.push(character);
      }
      return acc;
    }, []);

    const aoeZones = this.aoeService.getActiveAoeZones(character.locationId);

    const mobs = this.runtimeMobService.getMobsByLocation(character.locationId);

    return {
      character,
      location,
      players: otherPlayers,
      aoeZones,
      mobs,
    };
  }
}
