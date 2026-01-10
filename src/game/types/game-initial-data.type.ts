import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { CachedLocation } from 'src/world/location/types/cashed-location.type';

import { IRuntimeMob } from '../services/characters/runtime-mob/types/runtime-mob.type';
import { IRuntimeNpc } from '../services/characters/runtime-npc/types/runtime-npc.type';
import { ActiveAoEZone } from '../services/combat/services/aoe/types/active-aoe-zone.type';
import { IAvailableQuestPayload } from '../services/interaction/services/quest/runtime-quest/types/available-quest-payload.type';

export interface GameInitialData {
  character: IRuntimeCharacter;
  players: IRuntimeCharacter[];
  mobs: IRuntimeMob[];
  aoeZones: ActiveAoEZone[];
  location: CachedLocation;
  npcs: IRuntimeNpc[];
  availableQuests: IAvailableQuestPayload[];
}
