import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { GameInitialData } from 'src/game/types/game-initial-data.type';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { LocationService } from 'src/world/location/location.service';

import { Injectable } from '@nestjs/common';

import { PlayerStateService } from '../../characters/player-state/player-state.service';
import { AoeService } from '../../combat/services/aoe/aoe.service';
import { EntityRegistryService } from '../../entity-registry/entity-registry.service';
import { QuestIndexService } from '../../interaction/services/quest/quest-index/quest-index.service';
import { RuntimeQuestService } from '../../interaction/services/quest/runtime-quest/runtime-quest.service';
import { IAvailableQuestPayload } from '../../interaction/services/quest/runtime-quest/types/available-quest-payload.type';

@Injectable()
export class GameInitialDataService {
  constructor(
    private readonly redisService: RedisService,
    private readonly playerStateService: PlayerStateService,
    private readonly registryService: EntityRegistryService,
    private readonly locationService: LocationService,
    private readonly aoeService: AoeService,
    private readonly runtimeQuestService: RuntimeQuestService,
    private readonly questIndexService: QuestIndexService,
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
    const npcs = this.registryService.getEntitiesByLocation('npc', character.locationId);

    const questsByNpc = this.questIndexService.getByNpcs(npcs);
    const availableQuests = this.runtimeQuestService.getAvailableQuests(character, questsByNpc);

    const npcToQuestId = new Map<string, string[]>();

    for (const quest of availableQuests) {
      const quests = getOrCreate(npcToQuestId, quest.giverNpc.id, () => []);
      quests.push(quest.id);
    }

    const npcsWithAvailableQuests = npcs.map(npc => ({
      ...npc,
      hasAvailableQuests: npcToQuestId.has(npc.id),
    }));

    return {
      character,
      location,
      players: otherPlayers,
      aoeZones,
      mobs,
      npcs: npcsWithAvailableQuests,
    };
  }
}
