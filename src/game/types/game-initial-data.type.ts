import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { CachedLocation } from 'src/world/location/types/cashed-location.type';

import { IRuntimeMob } from '../services/characters/runtime-mob/types/runtime-mob.type';
import { INpcWithQuestState } from '../services/characters/runtime-npc/types/npc-with-quest-state.type';
import { ActiveAoEZone } from '../services/combat/services/aoe/types/active-aoe-zone.type';

export interface IGameInitialData {
  character: IRuntimeCharacter;
  players: IRuntimeCharacter[];
  mobs: IRuntimeMob[];
  aoeZones: ActiveAoEZone[];
  location: CachedLocation;
  npcs: INpcWithQuestState[];
}
